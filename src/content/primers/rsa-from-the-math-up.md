---
title: "RSA from the math up"
dek: "diffie-hellman solves the key-sharing problem. RSA solves a different one — how can anyone send you encrypted data without sharing a secret first? the math, the trapdoor, and the signatures."
date: 2026-06-28
level: intermediate
tags: ["crypto", "number-theory"]
readingTime: 20
draft: false
---

- **Diffie-Hellman solves:** how can two strangers create the same key?
- **RSA solves:** how can anyone encrypt data for me?

RSA is a public-key (asymmetric) cryptographic algorithm that uses two mathematically related keys: a public key for encrypting data and a private key for decrypting it. Although the keys are mathematically related, the private key cannot be derived from the public key.

---

## the problem RSA solves

Alice wants people all over the world to send her secret messages. With symmetric encryption, Alice and Bob need to somehow share a secret key first.

```
Alice <---- secret key ----> Bob
```

But how do they share the key safely? That's the key-distribution problem.

### the symmetric encryption problem

Suppose Alice wants 1 million people to send her encrypted messages. She would need to somehow securely give a secret key to every one of them. That does not scale.

### RSA's idea

RSA says: what if I could publish a lock, but keep the key private?

Think of a mailbox:

```
Anyone can put mail in.
Only the owner of the box can open it.
```

That's exactly RSA. Alice creates:

```
Public key  ->  Everyone can know it
Private key ->  Only Alice knows it
```

Anyone can do:

```
Encrypt(message, publicKey)
```

Only Alice can do:

```
Decrypt(ciphertext, privateKey)
```

This is asymmetric encryption. The key idea is: **anyone can see the ciphertext message, but only Alice can decrypt it.**

---

## the math idea behind RSA

RSA relies on a special mathematical trick:

```
for encryption: raise power to e
for decryption: raise power to d

e.g.

Message
   |
 ^e
   |
Scrambled
   |
 ^d
   |
Original Message
```

and you get your original value back. The amazing part is:

```
(m^e)^d = m
```

This is the entire heart of RSA.

---

## why does this work? (euler's theorem)

Euler's theorem states:

```
a^((p-1)(q-1)) ≡ 1 (mod pq)
```

and:

```
a^((p-1)(q-1)+1) ≡ a (mod pq)
```

and:

```
a^r = a (mod pq)
where
r = 1 (mod (p-1)(q-1))
```

Requirement being: where `p` and `q` are primes.

All of the equations above mean the same thing — that the result of `LHS` is congruent (identical/similar/compatible) with the result of `RHS`. These are mathematical truths and we can achieve asymmetric encryption using these mathematical truths. You don't need to memorize these. The important idea is:

Euler discovered certain exponents that make numbers "wrap around" back to themselves. Like a clock.

Imagine modulo `13`:

```
0 1 2 3 4 5 6 7 8 9 10 11 12
```

After 12 comes:

```
0 again
```

Everything repeats. Euler found the length of those cycles. RSA exploits those cycles.

---

## RSA (Rivest-Shamir-Adleman)

RSA states:

```
(m^e)^d = m (mod n)
where n = pq,
    p is prime,
    q is prime,
    ed = 1 (mod (p-1)(q-1))
```

### 1. prime factorization

We previously talked about Diffie-Hellman key exchange and it relied on this property in which the discrete logarithm is a computationally difficult problem (after Alice and Bob exchange values like `g^a` and `g^b`, an attacker sees those values but cannot feasibly work backward to recover the secret exponents `a` or `b`. The hard part is **recovering the exponent from the result**, which is the discrete logarithm problem. Basically it is difficult to "undo" exponentiation).

Another problem that is difficult in math is called the "prime factorization" problem.

It is easy to do this:

```
7 x 13 = ?
7 x 13 = 91
```

But it is hard to do this:

```
187 = ? x ? .. x ?
187 = 11 x 17
```

It is easy to multiply but it is hard to go the other way — meaning, what two numbers resulted in that multiple? Finding that is hard. These numbers are called prime factors (in the example above, `11` and `17` are prime factors that produced `187`. This process is also called factoring a large number into its constituent prime numbers).

You have to do brute forcing to find the prime numbers, which is computationally difficult. And this principle is what makes RSA work.

### 2. RSA key generation

1. Choose two large prime numbers `p` and `q`. These prime numbers can be efficiently found using a *primality* test.
2. Compute `n = pq`. We multiply those two prime numbers (reason behind this discussed in the prime factorization section) to get `n` (`n` is our modulus). This is what makes RSA so hard to crack.
3. Compute `φ(n) = (p-1)(q-1)`. Result of `(p-1)(q-1)` is stored in `φ(n)` (`φ` is Phi).
4. Choose `e` such that the greatest common denominator `gcd(e, φ(n)) = 1` (1 means coprime). In other words, we need some value where `e` and `φ(n)` are coprime. (If the GCD of two numbers is **1**, then the numbers are called **coprime** or relatively prime — they have no common positive divisors other than 1.)
   - The most common value (almost always the case in standard implementations of RSA) for `e` is `0x10001`, or in decimal `65537` — the well-known Fermat prime `2^16 + 1`.
5. Compute `d = e^-1 (mod φ(n))`. `e^-1` is the modular inverse (the number that undoes multiplication — the result of modular inverse, the remainder, is always equal to `1`). The inverse can be efficiently found using the *extended Euclidean algorithm* for large numbers.

> **note:** `φ(n)` is used **only to construct the exponent d**. `n` is used **for the actual encryption and decryption arithmetic**.

Before continuing, let's talk more about modulo inverse using modulo-7 as an example:

- Start with `2`.
- Multiply by `3`, result is `6`.
- Now multiply that number again by `5` which is the inverse (an **inverse** is simply something that reverses the effect of an operation — you'll see this in the next point), result is `30`.

Now if we were to perform the modulo-7 operation on this number:

```
30 % 7 => 2
or
30 ≡ 2 (mod 7)
```

So `30` and `2` are considered the same result in modulo-7 arithmetic. Now you can clearly see the effect of the `5` inverse here: it brought us back to `2`.

Think of modulo `7` as a circle:

```
0 → 1 → 2 → 3 → 4 → 5 → 6 → back to 0
```

On that circle:

- `2`, `9`, `16`, `23`, and `30` all represent the same position.
- Multiplying by `3` moves you to a different position.
- Multiplying by `5` moves you back to the original position.

That's what "undo" means. A useful analogy is ordinary arithmetic:

- Multiplying by `3` and then by `1/3` gives you back the exact same number.
- Modulo-7, multiplying by `3` and then by `5` gives you back the same position on the modulo-7 circle.

In modulo-7 arithmetic, `5` plays the same role as the ordinary arithmetic `1/3`.

#### example

Let's do a tiny example. (Not secure. Real RSA uses thousands of bits.)

Choose primes:

```
p = 11, q = 17
```

Compute `n`:

```
n = pq
n = 11 × 17 = 187
```

Compute `φ(n)`:

```
(11 - 1)(17 - 1)
10 × 16
160
```

Choose:

```
e = 7
```

Need:

```
gcd(7, 160) = 1
```

which is true.

Find `d` such that:

```
e * d ≡ 1 mod 160
```

Need:

```
7 * d ≡ 1 mod 160
```

Solution:

```
d = 23

d was computed using d = e^-1 (mod φ(n)).
And φ(n) requires knowing p and q.
```

because:

```
7 × 23 => 161
and
161 mod 160 => 1
```

Perfect.

Public key:

```
(e, n)
(7, 187)
```

Private key:

```
(d, n)
(23, 187)
```

### 3. RSA encryption

Now we have the key, and to encrypt, we'll use that generated key (we're going to perform encryption with all of the data we have arrived at — the data being the key).

```
c = m^e (mod n)
where c is ciphertext,
    m is plaintext,
    e is public key exponent,
    n is key modulus
```

This can be efficiently computed using modular exponentiation — a method that calculates the remainder of a number raised to a large power, divided by a modulus.

#### example

Suppose:

```
m = 5
```

Encrypt:

```
c = m^e mod n
c = 5^7 mod 187
c = 78125 mod 187
c = 146
```

Bob sends:

```
146
```

### 4. RSA decryption

To decrypt:

```
m = c^d (mod n)
where m is plaintext,
    c is ciphertext,
    d is private key exponent,
    n is key modulus
```

This can also be efficiently computed using modular exponentiation.

#### example

Alice computes:

```
m = 146^23 mod 187
m = 5
```

Original message recovered.

### 5. why can't an attacker recover `d`?

This is the real security question, and its answer reveals why RSA is so secure. Remember:

```
n = p * q
```

Publicly known. For example, `187`.

To compute `φ(n)`, you need:

```
(p-1)(q-1)
```

which requires knowing `p` and `q`. If an attacker wanted to generate a key for decryption, they would stop here — as computing the reverse of the prime factor is computationally infeasible. For small numbers:

```
187 = 11 x 17
```

Easy. But for a 2048-bit RSA modulus (`n = pq`):

```
617-digit number
```

Factoring it is astronomically hard.

### 6. the most important insight

This is the interesting part — it once again highlights why computing the inverse of a prime factor is computationally infeasible.

To encrypt:

- Need `e`.
- Need `n`.

Both are public. To decrypt:

- Need `d`.

And `d` depends on:

```
φ(n)
```

Which depends on:

```
p and q
```

Which require factoring:

```
n
```

So:

```
Knowing n
      ↓
Need p and q
      ↓
Need φ(n)
      ↓
Need d
      ↓
Can decrypt
```

The hard step is factoring `n`. That's where RSA gets its security.

### 7. RSA signing

A digital signature answers a different question from encryption. Encryption answers: "can only Alice read this message?" Bob encrypts with Alice's **public key**, and only Alice can decrypt with her **private key**.

Suppose Alice has:

- Public key: `(e, n)`
- Private key: `(d, n)`

Bob wants to send Alice a message `m`. He computes:

```
c = m^e (mod n)
```

using Alice's public key. Alice decrypts:

```
m = c^d (mod n)
```

because RSA is constructed so that:

```
(m^e)^d ≡ m (mod n)
```

**Signature answers a different question:** "did this message really come from Alice?"

Alice signs the message with her **private key**, and everyone can verify it with their copy of her public key. So Alice computes the signature using her private key:

```
Signature = m^d mod n
```

Only Alice can compute this signature. Anyone can verify the authenticity of the signature using Alice's public key (signature verification):

```
Signature^e mod n
```

If the original message appears, then this is a valid signature and Alice must have signed it.

---

## the big picture

The major cryptographic systems we've covered so far:

| System                     | Solves                                              |
| -------------------------- | --------------------------------------------------- |
| Symmetric Encryption (AES) | Fast encryption when both sides already share a key |
| Diffie-Hellman             | Creating a shared secret over the Internet          |
| RSA Encryption             | Let anyone encrypt data for you                     |
| RSA Signatures             | Prove you own a private key and signed a message    |

- **Diffie-Hellman security** comes from the **discrete logarithm problem** (where reversing an exponent is computationally unfeasible. There is no efficient classical way to solve this. Quantum computers' ability to solve this problem is the most immediate thing that makes them so dangerous to cryptography.)
- **RSA security** comes from the **integer factorization problem**.

---

## code

The code below demonstrates how RSA decryption works.

```python
import math
from Crypto.PublicKey import RSA

e = bytes.fromhex('00010001')
p = bytes.fromhex('dd49d11c7c400bda2a4c927af19be4ff7e4d15730d73cf9581c0d56e0e45a98bc38d7d381a97cfe136ac389ded29561b72ec65b402b301797f522f1135271d90f1f9b4c594df3e00e3433fe66ebe086365fc2af80b847f08adf44eae0b3748b5589aaf2bdaba8351ac6848dfe46ad0a6da691a42e712f031ea738ba4c86f40e7')
q = bytes.fromhex('ecf27f53ef67fc61f7a7e2abdf8c2f1e2f70c9384a1156ec0ccdffd9cbc40406ef00d4bcaf10d27a129fbffb4a249c7eaececbbab60fee67fb53c0cb6fbc49a9a4d6c9a71bb411caa3d47aeb04b31501fca90bac9e54ea67a440f685b6a1a4b579644da8f382fb5b05bc414484f189fbcd002e3ccebee8be29e1386be6d1591d')
ciphertext = bytes.fromhex('446728a243bd7d6c9c22c86274045ef0433786e1479f6ff5d51227303f165d032c2dee7ca509242a580ec84d0ec31844525ed6a10b104708f0509e9a84cfab63b7945ca376852d6fdbfe029083ae13f20f8efb3ca04ed1ba804962106288511dc2aacc8cd16b1840a194da6085316c3372db169d778b902c61e2f306f3b44640d157ffc312a71cff5902db6ae60b0e393e901681517acfff6ea93bfb5f24640a455a9b4638e992d1ec6bc4baaa84948805a4e06360234c8e48cec855f20b4f65b9a7e08a4b7e039b5f99822ac2a7750cad50079f44823f5f2343750d08a1ce1b2fb2168b2d8f40c1ddfeeb55f8ab6eb30765513933e42daa8badc2fd2779cfbd')

# we will calculate n, φ(n) and d as we already have p and q
# converting everything to int first
e_int = int.from_bytes(e, "big")
p_int = int.from_bytes(p, "big")
q_int = int.from_bytes(q, "big")
# c is little endian because of this in the challenge script:
#   ciphertext = int.from_bytes(flag, "little")
# meaning the byte order was set to little endian. now when converting to int,
# we have to keep the byte order in mind so that it does not turn into gibberish
c = int.from_bytes(ciphertext, "little")

# calculating n
n = p_int * q_int
print(f"n: {n}")

# calculating φ(n)
phi_n = (p_int - 1) * (q_int - 1)
print(f"φ(n): {phi_n}")

# check if gcd(e, φ(n)) = 1 condition is satisfied
gcd_result = math.gcd(e_int, phi_n)
if gcd_result == 1:
    print(f"GCD condition satisfied, GCD is: {gcd_result}")
    # calculate d, the private key exponent.
    # d is the modular inverse of e modulo φ(n), meaning:
    #     (e * d) mod φ(n) = 1
    #
    # example:
    #     e = 7, d = 23, φ(n) = 160
    #     7 * 23 = 161
    #     161 mod 160 = 1
    #
    # we compute d using e⁻¹ mod φ(n). the equation above
    # can then be used to verify that the calculated d is correct.
    #
    # d is used as the private key exponent during decryption:
    #     m = c^d mod n
    d = pow(e_int, -1, phi_n)
    print(f"Private key: {d}")

    # since private key has been calculated, lets decrypt the ciphertext
    m = pow(c, d, n)
    # convert m (int) to bytes and remove trailing null bytes
    m_plaintext = m.to_bytes(256, "little").strip(b"\x00")
    print(f"Plaintext: {m_plaintext}")
```