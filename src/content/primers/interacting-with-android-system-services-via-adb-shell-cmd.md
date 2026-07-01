---
title: "Interacting with Android System Services via adb shell cmd"
dek: "Learn why Android's cmd utility is the preferred way to interact with system services over raw Binder service call commands"
date: 2026-06-30
level: intermediate
tags: ["android", "adb", "android-internals", "binder", "shellcommand"]
readingTime: 12
draft: false
---

- **Purpose:** `cmd` is Android's command-line interface for interacting with system services over ADB.
- **Reality:** Although it looks like a low-level system command, it usually invokes Java code inside Android's system server.
- **Mechanism:** Commands are parsed by subclasses of `android.os.ShellCommand`, which then call the appropriate framework APIs or Binder interfaces.

## Problem with `service call`

I wanted to find a way to enable Location through `adb shell`. My first attempt was to use the low-level Binder interface via:

```
service call location
```

That said, `service call` is only a generic Binder client. It is generic because it's a very low level tool that can talk to any Android system service, but it doesn't understand what the service does. It lets you directly call a system service through binder but you must know:

+ The binder transaction number.
+ The argument types.
+ The order of the arguments.

For example:

```bash
service call location 12 i32 1
```

The number `12` is an example of a transaction code. Every method is assigned a numeric ID called a transaction code:

| Concept          | Meaning                                    |
| ---------------- | ------------------------------------------ |
| Method name      | `setLocationEnabled(true)`                 |
| Transaction code | `12` (just an internal ID for that method) |
So instead of calling:

```
setLocationEnabled(true)
``` 

Binder calls something like:

```
transaction #12 with argument 1
```

These transaction codes are defined inside Android framework's source code, typically in something like:

```java
static final int TRANSACTION_setLocationEnabled = 12;
```

Inside a service stub, for example `LocationManagerService`. And Android internally does something like this:

```java
switch (code) {
    case TRANSACTION_setLocationEnabled:
        ...
}
```

 You normally don't guess them, you look them up or generate them from code.

The `i32 1` is part of the Binder parcel (a binder parcel is just a container/package that holds the data being sent form one process to another) format used by `service call`. It means:

- `i32` → 32-bit integer
- `1` → value passed

> "Pass one argument, which is a 32-bit integer whose value is 1. This 32-bit integer  with value 1 is then put into the Parcel"

So:

```bash
service call location 12 i32 1
```

Roughly means:

Call method 12 on location service with integer argument 1.

> `service call` can call **any Binder service**, but it has **no built-in knowledge of the methods, arguments, or transaction codes** for services like:
> 
> - Location
> - Power
> - Audio
> - etc.
> 
> That's why it is called **generic**: it is a general-purpose Binder client, not a tool designed specifically for any one service.

The transaction codes are generated from the AIDL interface (at compile time) and can change between Android versions and even vendor builds, making this approach inconvenient and brittle.

### 1. Why Android hides this from you:

Because Binder is meant to be an internal IPC mechanism, not an API. So Android expects developers to use:

+ Java APIs (`LocationManager`). E.g. `LocationManager.setLocationEnabled(true)`
+ or shell commands (`cmd location`). E.g. `cmd location set-location-enabled true`
+ not raw transaction IDs.

### 2. Side-note on AIDL:

Android Interface Design Language is a way to define which methods one process can call in another process. Basically, it defines the methods.

For example, imagine the location service says:

```
You are allowed to call:
- isLocationEnabled()
- setLocationEnabled(boolean enabled)
- getCurrentLocation()
```

That list of methods is defined in an AIDL interface.

```
AIDL file
    │
    ▼
Defines the remote methods
(e.g. setLocationEnabled(), isLocationEnabled())
    │
    ▼
AIDL compiler generates Binder classes
    │
    ├── Stub (server side)
    │     ├── Transaction codes
    │     ├── Reads Parcels
    │     └── Dispatches to the correct method
    │
    └── Proxy (client side)
          ├── Writes Parcels
          └── Sends Binder transactions
    │
    ▼
Binder transports the transaction
    │
    ▼
Stub invokes the actual service
(e.g. LocationManagerService)
```

The AIDL interface is compiled **once**, when Android (or the app/service) is built. It generates a Binder stub. I added proxy just for clarity but we will focus more on stubs.

```
During build time (once)
------------------------
ILocationManager.aidl
        │
        ▼
AIDL compiler
        │
        ▼
Generates:
- ILocationManager.Stub
- ILocationManager.Proxy
```

These are present in the device. Then at runtime, every service call simply uses the existing Binder stub:

```
Runtime
-------

service call location 12 i32 1
          │
          ▼
Binder
          │
          ▼
Existing ILocationManager.Stub
          │
          ▼
LocationManagerService
```

A good analogy is:

- **AIDL file** = a blueprint
- **AIDL compiler** = the factory
- **Binder Stub** = the finished machine built in the factory
- **Binder transactions** = customers using that machine over and over

#### Why does Binder need AIDL?

Apps and system services run in different processes. They can't directly call each other methods like plain/normal Java objects. Instead, Android uses Binder, and AIDL tells Binder:

+ What methods exist.
+ What arguments each method takes.
+ What each method returns.

Transaction codes are generated from AIDL. Suppose the AIDL interface for the location service looks like this:

```
isLocationEnabled()
setLocationEnabled(boolean enabled)
getCurrentLocation()
```

Android might generate something like:

```
1 → isLocationEnabled()
2 → setLocationEnabled()
3 → getCurrentLocation()
```

Now imagine a newer Android version adds another method at the top:

```
getProviderInfo()
isLocationEnabled()
setLocationEnabled(boolean enabled)
getCurrentLocation()
```

The generated transaction codes might become:

```
1 → getProviderInfo()
2 → isLocationEnabled()
3 → setLocationEnabled()
4 → getCurrentLocation()
```

So `setLocationEnabled()` changed from transaction **2** to **3**, even though the method itself didn't change.

That's one reason relying on raw transaction numbers is considered brittle.

---

## Discovering the Correct Command

Instead of continuing to search for Binder transaction numbers, I inspected the shell interface exposed by the Location service:

```bash
cmd location
```

The output displayed all supported commands:

```
Location service commands:
    is-location-enabled
    set-location-enabled true|false
```

From this, it was immediately apparent that Android already provides a high-level shell command for toggling the master Location switch.

To enable Location:

```
cmd location set-location-enabled true
```

To disable Location:

```
cmd location set-location-enabled false
```

---
## Why This Works

Many Android system services expose a shell (because it is in the shell) interface through the `cmd` utility. Internally, these commands are implemented by subclasses of `android.os.ShellCommand` (for example `LocationShellCommand`).

Rather than invoking binder transactions directly, the shell command parses user-friendly arguments and performs appropriate Binder calls internally. The architecture is roughly:

```
cmd location set-location-enabled true 
			 │ 
			 ▼ 
	 LocationShellCommand 
			 │ 
			 ▼ 
	LocationManagerService
			 │ 
			 ▼ 
   Binder (ILocationManager)
```

This means there is no need to determine Binder transaction IDs or manually construct Binder parcels.

---

## Research Methodology

When interacting with an unfamiliar Android system service:

1. Enumerate available shell services:

```
cmd -l
```

2. If a matching service exists, inspect its commands:

```
cmd <service>
```

or

```
cmd <service> help
```

3. Only resort to `service call` if no shell interface exists or if the desired functionality is not exposed.

This approach is generally more reliable because shell commands are stable, human-readable, and maintained by the Android framework developers, whereas Binder transaction numbers are implementation details that may vary across Android versions and vendor modifications.

---
## Simple analogy

Imagine android services like a building:

+ `cmd location` = receptionist, speaks human language (friendly interface).
+ `service call` = internal phone system with extension numbers (raw internal phone system).
+ Binder = the brains; wiring, connecting everything.
