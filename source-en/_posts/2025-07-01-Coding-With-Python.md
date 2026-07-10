---
layout: post
title: "Software Engineering in Practice: Python Edition"
categories: Security Architect
kerywords: python flask celery react nextjs OOP AI database ORM framework software engineering logging exception handling version management deployment continuous delivery containerization cloud K8S AI-Driven Cursor Gemini ChatGPT SQLAlchemy
tags: Security Dev
translated: true
---


> I've done some product design work, but my actual code output has been pretty limited — especially in the past two years. The good news is I've been picking things back up lately, so here are some notes. Fair warning: this is pretty entry-level stuff.

# 1. Starting with the Language

Python is a simple language with a rich ecosystem — there's a library for basically everything. That's what I thought before reading *Expert Python Programming*. The book has two editions; I read the first one back in 2017 and it completely blew my mind. Sure, you can pick up the basics in a day, but there's a lot more worth knowing beyond that. Here are some topics worth digging into:

* Naming and comments
* Package management: `__init__.py` and `requirements.txt`
* Relative vs. absolute vs. current execution paths (`pathlib`)
* Calling across different Python files
* Decorators
* Context managers
* Async processing
* Parallel processing
* Variable-length arguments
* Function type hints
* Class inheritance
* Advanced data structures
* Common usage of built-in standard libraries: `collections`, `contextlib`, `functools`, `multiprocessing`, `asyncio`, etc.
* Dynamic file loading

## 1.1 Naming Conventions

- **Variables**: lowercase with underscores, e.g. `my_variable`
- **Functions**: lowercase with underscores, e.g. `calculate_sum()`
- **Classes**: CapWords, e.g. `MyClass`
- **Constants**: ALL_CAPS with underscores, e.g. `MAX_CONNECTIONS`
- **Modules**: short, lowercase names; underscores are fine if they help readability, e.g. `my_module.py`

## 1.2 Comments

- **Block comments (#)**: explain the logic of the code block that follows
- **Inline comments**: explain a tricky line — use sparingly; good code should explain itself
- **Docstrings (`"""..."""`)**: document modules, classes, functions, or methods. This is what `help()` and auto-doc tools pull from.

```python
"""This is a module-level docstring explaining what this module does."""

MAX_RETRIES = 3  # Constant: max retry count

class NetworkHandler:
    """Handles network requests."""
    def __init__(self, host):
        self.host = host

def fetch_data(url: str) -> str:
    """
    Fetch data from the given URL.

    Args:
        url (str): The URL to fetch data from.

    Returns:
        str: The text content returned from the URL.
    """
    # This is a block comment explaining the logic below
    # ... some logic here ...
    data = f"Data from {url}" # This is an inline comment
    return data

print(help(fetch_data))
```

## 1.3 Package Identification

`__init__.py` serves two main purposes:

- **Marks a directory as a Python package**: Any directory with `__init__.py` is treated as a package by Python, allowing you to import modules from it using dot notation. Even an empty file works.

- **Defines the package's public API**: You can use `__all__` in `__init__.py` to explicitly control what gets exported when someone does `from my_package import *`. It's a clean way to manage namespaces.

Example structure:

```log
my_project/
├── my_package/
│   ├── __init__.py
│   ├── module1.py
│   └── module2.py
└── main.py
```

`my_package/__init__.py`:

```python
print("Initializing my_package...")
from .module1 import func1
from .module2 import MyClass

# Define public API
__all__ = ['func1', 'MyClass']
```

## 1.4 Project Dependencies

`requirements.txt` records all third-party libraries your project depends on along with their versions.

Generating `requirements.txt`:

* Using a virtual environment

```bash
pip freeze > requirements.txt
```
* Using `pipreqs`

```bash
pipreqs /path/to/your/project --force --encoding utf-8
```

* Installing from `requirements.txt`:

```bash
pip install -r requirements.txt
```

Example `requirements.txt`:

```python
celery==5.5.3
cryptography==45.0.4
Flask==3.1.1
flask_cors==6.0.0
flask_sqlalchemy==3.1.1
pandas==2.3.0
Requests==2.32.4
```

## 1.5 Path Handling

Forget `os.path`. The `pathlib` module handles filesystem paths in an object-oriented way — more readable and cross-platform friendly.

| Operation | `os.path` (old way) | `pathlib` (new way) |
| :--- | :--- | :--- |
| Get current path | `os.getcwd()` | `Path.cwd()` |
| Join paths | `os.path.join('dir', 'file.txt')` | `Path('dir') / 'file.txt'` |
| Check if file exists | `os.path.exists(p)` | `Path(p).exists()` |
| Read file | `with open(p, 'r') as f: ...` | `Path(p).read_text()` |

```python
from pathlib import Path

# Get the current working directory
current_path = Path.cwd()
print(f"Current working path: {current_path}")

# Build a path
config_path = current_path / 'config' / 'settings.ini'
print(f"Config file path: {config_path}")

# Get parent directory
parent_dir = config_path.parent
print(f"Parent directory: {parent_dir}")

# Check if path exists
print(f"Does the config file exist? {config_path.exists()}")
```

-----

## 1.6 Calling Across Python Files (Modularization)

* Absolute imports // Recommended — they start from the project root (the top-level package containing `__init__.py`) and are unambiguous.

```python
# In my_project/main.py
from my_package.module1 import func1
from my_package.module2 import MyClass

func1()
instance = MyClass()
```

* Relative imports // Use a dot (`.`) to indicate the current location. One dot = current directory, two dots = parent directory. Only works inside a package — can't be used in a top-level script.

```python
# In my_package/module1.py, importing from module2
from .module2 import MyClass # . means starting from the current package (my_package)

def func1():
    print("This is func1.")
    c = MyClass()
    c.show()
```

-----

## 1.7 Decorators

A decorator is essentially a function that takes another function as input and returns a new function. It lets you add new behavior to an existing function — like logging, timing, or permission checks — without touching the original code.

```python
import time
from functools import wraps

def timing_decorator(func):
    """A simple timing decorator."""
    @wraps(func)  # wraps preserves the original function's metadata (__name__, __doc__, etc.)
    def wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        result = func(*args, **kwargs)
        end_time = time.perf_counter()
        print(f"Function '{func.__name__}' ran in: {end_time - start_time:.4f} seconds")
        return result
    return wrapper

@timing_decorator
def complex_calculation(n):
    """A simulated heavy computation."""
    total = 0
    for i in range(n):
        total += i
    return total

print(complex_calculation(10000000))
```

-----

## 1.8 Context Managers

Context managers use the `with` statement to automatically handle resource allocation and cleanup — ensuring things like file handles and network connections get properly closed even when exceptions occur.

* Class-based implementation // You implement `__enter__` and `__exit__` yourself.

```python
class MyTimer:
    def __enter__(self):
        print("Timer started...")
        self.start_time = time.perf_counter()
        return self # This return value gets assigned to the variable after 'as'

    def __exit__(self, exc_type, exc_val, exc_tb):
        # exc_type, exc_val, exc_tb receive exception info if one occurred
        self.end_time = time.perf_counter()
        print(f"Block ran in: {self.end_time - self.start_time:.4f} seconds")
        # Returning True means the exception has been handled
        return False

with MyTimer():
    # Do something time-consuming
    time.sleep(1)
```

* Using `contextlib`

```python
from contextlib import contextmanager

@contextmanager
def simple_timer():
    print("Timer started...")
    start_time = time.perf_counter()
    try:
        yield # Code before yield is __enter__, code after is __exit__
    finally:
        end_time = time.perf_counter()
        print(f"Block ran in: {end_time - start_time:.4f} seconds")

with simple_timer():
    time.sleep(1)
```

## 1.9 Async Processing

Async processing lets a program switch to other tasks while waiting for I/O operations (like network requests or database reads/writes), dramatically improving single-thread efficiency. `asyncio` is Python's standard library for writing concurrent code.

  - `async def`: defines a coroutine
  - `await`: pauses the current coroutine and waits for an awaitable to complete

```python
import asyncio
import time

async def fetch_data(url: str, delay: int) -> dict:
    print(f"Starting fetch for {url}...")
    await asyncio.sleep(delay) # Simulates network I/O delay
    print(f"Finished fetching {url}")
    return {"url": url, "status": "ok"}

async def main():
    start = time.perf_counter()
    
    # Use asyncio.gather to run multiple coroutines concurrently
    tasks = [
        fetch_data("http://site1.com", 2),
        fetch_data("http://site2.com", 1),
        fetch_data("http://site3.com", 3),
    ]
    results = await asyncio.gather(*tasks)
    
    end = time.perf_counter()
    print(f"All tasks done, total time: {end - start:.2f} seconds")
    print("Results:", results)

# In Jupyter or IPython, you can await directly:
# await main() 

# In a regular .py file, start it like this:
if __name__ == "__main__":
    asyncio.run(main())
```

## 1.10 Parallel Processing

Because of Python's Global Interpreter Lock (GIL), a single Python process can't use multiple CPU cores simultaneously. The `multiprocessing` module sidesteps the GIL by spinning up multiple processes, enabling true parallel computation.

```python
import multiprocessing
import time

def cpu_bound_task(n):
    """A CPU-intensive task."""
    count = 0
    for i in range(n):
        count += i
    return count

if __name__ == "__main__":
    N = 100_000_000
    
    start_time = time.perf_counter()

    # Create a process pool that auto-manages process creation and teardown
    with multiprocessing.Pool(processes=4) as pool:
        # Use map to distribute tasks across the pool
        # Split the task into 4 parts
        results = pool.map(cpu_bound_task, [N//4] * 4)
    
    total_result = sum(results)
    end_time = time.perf_counter()
    
    print(f"Parallel result: {total_result}")
    print(f"Parallel time: {end_time - start_time:.4f} seconds")

    # Compare against single-process
    start_time_single = time.perf_counter()
    single_result = cpu_bound_task(N)
    end_time_single = time.perf_counter()
    print(f"\nSingle-process result: {single_result}")
    print(f"Single-process time: {end_time_single - start_time_single:.4f} seconds")
```

## 1.11 Variable-Length Arguments (`*args` and `**kwargs`)

  - `*args`: packs multiple positional arguments into a tuple
  - `**kwargs`: packs multiple keyword arguments into a dict

```python
def flexible_function(*args, **kwargs):
    print("Positional args:", args)
    print("Keyword args:", kwargs)

flexible_function(1, "hello", True, name="Alice", age=30)
```

## 1.12 Type Hints

Python 3.5 introduced type hints — you can (but don't have to) add type information to function parameters and return values. Static analysis tools like `mypy` can then use these hints to catch type errors.

```python
from typing import List, Optional

def process_data(data: List[int], name: str) -> Optional[float]:
    """
    Process a list of integers.
    :param data: List of integers.
    :param name: Name of the dataset.
    :return: The average after processing, or None if the list is empty.
    """
    if not data:
        return None
    print(f"Processing data for {name}")
    return sum(data) / len(data)

# mypy would flag this call as an error:
# process_data("not a list", "test")
```

## 1.13 Class Inheritance

```python
class Animal:
    def __init__(self, name: str):
        self.name = name

    def speak(self):
        raise NotImplementedError("Subclasses must implement this method")

class Dog(Animal):
    def speak(self):
        return f"{self.name} says Woof!"

class Cat(Animal):
    def speak(self):
        return f"{self.name} says Meow!"

my_dog = Dog("Buddy")
my_cat = Cat("Lucy")

print(my_dog.speak())
print(my_cat.speak())
```

## 1.14 Advanced Data Structures

The `collections` module provides high-performance specialized container types as alternatives to Python's built-in `dict`, `list`, `set`, and `tuple`.

- `collections.defaultdict`: automatically creates a default value when you access a missing key
- `collections.Counter`: a dict subclass for counting things
- `collections.deque`: double-ended queue, O(1) appends and pops from both ends
- `collections.namedtuple`: tuple subclass with named fields for better readability

```python
from collections import defaultdict, Counter, deque, namedtuple

# defaultdict
s = 'mississippi'
d = defaultdict(int)
for k in s:
    d[k] += 1
print(sorted(d.items()))

# Counter
c = Counter(s)
print(c)
print(c.most_common(2)) # Top 2 most frequent elements

# deque
q = deque(maxlen=3) # Queue with max length of 3
q.append(1)
q.append(2)
q.append(3)
print(q)
q.append(4) # Adding a new element pushes out the oldest one
print(q)
q.appendleft(0)
print(q)

# namedtuple
Point = namedtuple('Point', ['x', 'y'])
p = Point(10, 20)
print(p)
print(p.x, p.y)
```

## 1.15 Standard Library Highlights

* `functools`

This module is mainly for higher-order functions — functions that operate on or return other functions.

  - `functools.wraps`: use this inside decorators to preserve the wrapped function's metadata (already shown in the decorator section)
  - `functools.lru_cache`: a powerful decorator that adds Least Recently Used (LRU) caching to a function — great for expensive computations with the same inputs

```python
from functools import lru_cache
import time

@lru_cache(maxsize=None) # maxsize=None means unlimited cache size
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

start = time.perf_counter()
print(fibonacci(35))
print(f"Fibonacci with cache: {time.perf_counter() - start:.6f}s")

# Without caching, fibonacci(35) would take ages
```

* `contextlib`
* `collections`
* `asyncio`
* `multiprocessing`


## 1.16 Dynamic File Loading

Sometimes you need to dynamically load Python modules at runtime based on config or user input. This is super common in plugin-style architectures. `importlib` is the standard way to do it.

Say you have this plugin structure:

```log
plugins/
├── __init__.py
├── plugin_a.py
└── plugin_b.py
```

`plugin_a.py`:

```python
def run():
    print("Executing Plugin A")
```

`plugin_b.py`:

```python
def run():
    print("Executing Plugin B")
```

Main program dynamically loading and running plugins:

```python
import importlib

def load_and_run_plugin(plugin_name: str):
    try:
        # Dynamically build the module path
        module_path = f"plugins.{plugin_name}"
        
        # Use importlib to dynamically import the module
        plugin_module = importlib.import_module(module_path)
        
        # Check if the module has a 'run' function and execute it
        if hasattr(plugin_module, 'run'):
            plugin_module.run()
        else:
            print(f"Plugin '{plugin_name}' has no 'run' function.")
            
    except ImportError:
        print(f"Error: Could not find or load plugin '{plugin_name}'.")

# Simulate loading plugins from config
plugins_to_load = ["plugin_a", "plugin_b", "plugin_c"] # plugin_c doesn't exist

for plugin in plugins_to_load:
    print(f"\n--- Loading {plugin} ---")
    load_and_run_plugin(plugin)
```

One last thing worth mentioning: for all the syntax, class design, async/parallel code in this section — AI can handle all of it. The code it writes is solid, often on par with or better than a mid-level engineer. But there's no question that relying on it too much creates a dependency. If you use AI as a teacher, it can help you pick up new knowledge fast. If you use it for everything, you start to get dull — you lose the thinking process, and you stop knowing how to break a problem into steps. My take: understand what the process looks like yourself, then let AI help you implement it. That's the better flow. (People outside the industry without foundational knowledge — that's a different conversation.)

# 2. OOP and Design Patterns

Object-oriented programming (OOP) and design patterns are two topics that come up constantly in software development, yet they always feel abstract when people talk about them. In practice, OOP thinking and sensible use of design patterns can eliminate a ton of repetitive code and keep your codebase well-structured.

When we talk about OOP, we're really talking about four core principles: Encapsulation, Inheritance, Polymorphism, and Abstraction.

```python
# Abstract base class (demonstrates Abstraction)
from abc import ABC, abstractmethod

class Animal(ABC):
    """
    Animal - Parent class (base class)
    This is an abstract class and cannot be instantiated directly.
    It defines a behavior 'speak' that all animals should have.
    """
    def __init__(self, name):
        # Encapsulation: the 'name' attribute is encapsulated inside the Animal class
        self.name = name

    @abstractmethod
    def speak(self):
        """
        Abstract method — subclasses must implement this.
        """
        pass

# Dog and Cat inherit from Animal (demonstrates Inheritance)
class Dog(Animal):
    """
    Dog - Child class (derived class)
    Inherits from Animal.
    """
    def speak(self):
        # Overrides the parent's speak method
        return f"{self.name} says Woof!"

class Cat(Animal):
    """
    Cat - Child class (derived class)
    Inherits from Animal.
    """
    def speak(self):
        # Overrides the parent's speak method
        return f"{self.name} says Meow!"

# --- Main program ---

# Create instances of different classes
my_dog = Dog("Buddy")
my_cat = Cat("Lucy")

# Print results — demonstrates Encapsulation (we access behavior through the object without caring about internals)
print(my_dog.speak())
print(my_cat.speak())


def animal_sound(animal: Animal):
    print(animal.speak())

animal_sound(my_dog)
animal_sound(my_cat)

```

As for design patterns — the common ones are Proxy, Singleton, Factory, etc. Not going to write them all out here; just check this GitHub project: [Python Patterns](https://github.com/faif/python-patterns)


# 3. Microservices

The only real measure of a microservice is whether you can rewrite it quickly in any language with a few hundred lines of code. The idea is simple: keep business logic within a single service and expose it to the outside world via API. For stateless requests, this is about as simple as it gets. For stateful ones, you need to think about data consistency and token propagation.

For writing APIs in Python, `flask` is the most straightforward framework, though `fastapi` seems to be winning lately. That said, as I mentioned — when building microservices, you can use any language. I recently ran into a platform that didn't have a Python SDK, so I had to write the logic using their Java SDK and then wrap it into an API service for Python to call.

## 3.1 Inter-Service API Calls

* Using Python to provide an API service
```python
from flask import Flask, jsonify, request, render_template, send_file
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cryptovault.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

@app.route("/api/apply", methods=["POST"])
def apply_for_asset():
    data = request.get_json()
    asset_type = data.get("type")
    
    try:
        if asset_type == 'certificate':
            if issuer == 'CFCA':
                new_cert_entry = Certificate(
                    id=new_id,
                    subject=common_name,
                    issuer="CFCA",
                    expires="Pending",
                    status="Processing"
                )
                db.session.add(new_cert_entry)
                
                history_entry = History(asset_id=new_id, status="Submitted", event_date=get_current_date())
                db.session.add(history_entry)
                
                db.session.commit() 
                # Call the celery task
                submit_csr_generation_and_ca_submission.delay(common_name, new_id, data.get("sans", ""))

```

Inside `submit_csr_generation_and_ca_submission`, we call other API services to complete the corresponding operations.

* Using Java to handle platform-specific logic and expose an internal API for Python to call
```java
package com.legendary.javalin;

import cfca.monkiki.util.XmlUtil2;
import cfca.ra.vo.response.CertResponseVO;
import com.google.gson.Gson;
import io.javalin.Javalin;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;

import java.io.File;
import java.io.IOException;

@Slf4j
public class ApiServer {
    public static void main(String[] args) throws IOException {

        Javalin javalin = Javalin.create();
        Javalin app = javalin.start(7070);

        // Define the POST endpoint for applying for a certificate
        app.post("/applyCertificate", ctx -> {
            try {
                CertificateRequest request = new Gson().fromJson(ctx.body(), CertificateRequest.class);
                CertificateService service = new CertificateService();
                CertResponseVO responseVO = service.applyForCertificate(request);
                String responseXml = XmlUtil2.vo2xml(responseVO, "Response");
                ctx.contentType("application/xml");
                ctx.result(responseXml);
            } catch (Exception e) {
                log.error("/applyCertificate process failed", e);
                ctx.status(500).result("Error processing request: " + e.getMessage());
            }
        });

        log.info("API Server started on port 7070. Use POST /applyCertificate to request a certificate.");
    }
}
```

## 3.2 Frontend/Backend Separation

Frontend/backend separation is itself a kind of microservice pattern — especially with frameworks like React, Angular, and Vue. In a microservices architecture where everything communicates via API, separating frontend and backend actually makes for a faster development workflow. The frontend can consume and assemble data on its own without being completely dependent on the backend. Honestly though, frontend isn't my strong suit — I rely on AI to turn prototypes into code. For `flask`, rendering frontend is easy enough, even if it's not quite "full" separation. The simplest case: just render an HTML file directly. You can also go the `next.js` route.

```python
@app.route("/")
def serve_dashboard():
    return render_template("index.html")
```

## 3.3 Async Calls

* Async task dispatch

`app.py` exposes the send endpoint; when the user clicks the send button, `tasks.py` triggers an async task in the background.

```python

@app.route("/api/certs/<string:cert_id>/send_pfx", methods=["POST"])
def send_cert_pfx(cert_id):
    data = request.get_json()
    pfx_password = data.get("password")
    recipient_email = data.get("email")

    if not pfx_password or not recipient_email:
        return jsonify({"error": "Recipient email and PFX password are required."}), 400

    # Trigger the background task
    from tasks import send_pfx_email_task
    send_pfx_email_task.delay(cert_id, pfx_password, recipient_email)

    return jsonify({"message": f"Certificate is being sent to {recipient_email} in the background."}), 202

```

If running on Windows: `celery -A tasks.celery_app worker -l info -P eventlet`


`tasks.py`
```python
@celery_app.task(name="tasks.send_pfx_file_with_email")
def send_pfx_email_task(cert_id, pfx_password, recipient_email):
    """
    Celery task to generate and email a PFX file in the background.
    """
    with app.app_context():
        crypto_key = CryptoKey.query.get(cert_id)
        cert_info = Certificate.query.get(cert_id)

        if not crypto_key or not crypto_key.certificate_pem or not crypto_key.private_key_pem or not cert_info:
            print(f"Error in task: Could not find certificate or key for {cert_id}")
            return

        try:
            private_key = serialization.load_pem_private_key(crypto_key.private_key_pem.encode(), password=None)
            cert = x509.load_pem_x509_certificate(crypto_key.certificate_pem.encode())
            
            pfx_bytes = pkcs12.serialize_key_and_certificates(
                name=cert_info.subject.encode(),
                key=private_key,
                cert=cert,
                cas=None,
                encryption_algorithm=serialization.BestAvailableEncryption(pfx_password.encode())
            )

            msg = MIMEMultipart()
            msg['From'] = app.config['SMTP_SENDER_EMAIL']
            msg['To'] = recipient_email
            msg['Subject'] = f"Your Certificate: {cert_info.subject}"

            body = f"Please find your requested certificate ({cert_info.subject}) attached as a password-protected PFX file.\n\nThe password to open the file is: {pfx_password}"
            msg.attach(MIMEText(body, 'plain'))

            part = MIMEBase('application', 'octet-stream')
            part.set_payload(pfx_bytes)
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', f'attachment; filename="{cert_info.subject}.pfx"')
            msg.attach(part)
            
            with smtplib.SMTP(app.config['SMTP_SERVER'], app.config['SMTP_PORT']) as server:
                server.starttls()
                server.login(app.config['SMTP_USERNAME'], app.config['SMTP_PASSWORD'])
                server.send_message(msg)
            print(f"Successfully sent PFX for {cert_id} to {recipient_email}")

        except Exception as e:
            print(f"Failed to send email for {cert_id}: {e}")
            traceback.print_exc()
```

## 3.4 Containerization

Using Docker to package code. Dockerfile for a Python app:

```Dockerfile
FROM python:3.10-slim

WORKDIR /app

RUN mkdir -p /app/data

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

Dockerfile for a Java app:
```Dockerfile
FROM maven:3.8.5-openjdk-11 AS builder

WORKDIR /app

COPY pom.xml .

COPY libs/ /app/libs/

RUN mvn install:install-file -Dfile=/app/libs/RAToolkit-3.3.9.1.jar -DgroupId=cfca.toolkit -DartifactId=RAToolkit -Dversion=3.3.9.1 -Dpackaging=jar
RUN mvn install:install-file -Dfile=/app/libs/CommonVO-3.3.9.1.jar -DgroupId=cfca.toolkit -DartifactId=CommonVO -Dversion=3.3.9.1 -Dpackaging=jar

COPY src /app/src

RUN mvn package -DskipTests

FROM eclipse-temurin:11-jre-jammy

WORKDIR /app

COPY --from=builder /app/target/my-javalin-app-1.0.jar /app/application.jar

EXPOSE 7070

ENTRYPOINT ["java", "-jar", "/app/application.jar"]

```

# 0x04 Frameworks and Libraries

There's a good analogy here: using a library is like shopping at IKEA — you pick what you want and use it however you like. Using a framework is like buying a fully furnished apartment — everything's already been designed and set up for you. The difference is really about who's in control. With a library, you're in control; the code does what you tell it. With a framework, you play by its rules — the framework calls you. "Don't call us, we'll call you."

For example, `flask` and `django` are two typical Python web frameworks, while `requests` and `Beautiful Soup` are typical libraries. On the frontend, `jquery` is a classic web library while `react` is a classic web framework. There's also a gray zone between the two — things like ORMs that are hard to categorize. They behave like a library (you call it to do things), but they also constrain you. If you've used SQLAlchemy, you know exactly what I mean.

Here are some Python frameworks and libraries worth knowing:

* **Web frameworks**: `flask`, `django`
* **DB-related**: `sqlalchemy`, `sqlite`, `redis`
* **Networking**: `requests`, `fastapi`
* **Data**: `pandas`, `sqlalchemy`, `sklearn`, `pytorch`, `keras`
* **Task scheduling**: `celery`, `gevent`
* **Cryptography**: `cryptography`
* **CLI**: `click`
* **Config**: `dynaconf`
* **Logging**: `logging`

On the frontend side, worth knowing: `react`, `next.js`, `tailwindcss`, `bootstrap`

# 5. Test-Driven Development

TDD is an agile method that ensures each individual function works as expected. The classic approach: write the test case first, then write code that passes it. What I'm describing here is a bit different from that strict definition — the goal is simply to write enough test coverage so your app actually runs correctly.

* Unit testing with `unittest`

```python
import os
import unittest
import json
import sqlite3
from datetime import datetime, timedelta
from app import app, get_db_connection, init_db

class CryptoVaultTestCase(unittest.TestCase):
    """Test suite for the CryptoVault Flask application."""

    def setUp(self):
        """Set up a new test client and a temporary database."""
        # Use an in-memory SQLite database for testing
        self.db_fd, app.config['DATABASE'] = ":memory:", ":memory:"
        app.config['TESTING'] = True
        self.client = app.test_client()

        # The application context is needed to work with the database
        with app.app_context():
            init_db()

    def tearDown(self):
        """Clean up the database after each test."""
        # The in-memory database vanishes on its own, so no file to close.
        pass

    def test_01_init_db(self):
        """Test if the database initialization creates all necessary tables."""
        with app.app_context():
            conn = get_db_connection()
            cursor = conn.cursor()
            tables = ["keys", "certificates", "history", "crypto_keys"]
            for table in tables:
                cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
                self.assertIsNotNone(cursor.fetchone(), f"Table '{table}' was not created.")
            conn.close()

    def test_02_create_and_get_ca(self):
        """Test the creation and retrieval of the internal CA."""
        with app.app_context():
            # Test CA creation endpoint
            response = self.client.post('/api/internal_ca/create')
            self.assertEqual(response.status_code, 200)
            json_data = json.loads(response.data)
            self.assertIn("Internal CA created", json_data['message'])

            # Test CA retrieval endpoint
            response = self.client.get('/api/internal_ca')
            self.assertEqual(response.status_code, 200)
            json_data = json.loads(response.data)
            self.assertIn("CN=cryptovault-ca.local", json_data['subject'])
            self.assertIn(".pem", json_data['pem'])

    def test_03_apply_for_rsa_key(self):
        """Test applying for a new RSA key."""
        response = self.client.post('/api/apply',
            data=json.dumps({
                "type": "key",
                "name": "Test RSA Key",
                "keyType": "RSA-4096"
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        json_data = json.loads(response.data)
        self.assertIn('key created successfully', json_data['message'])
        key_id = json_data['id']

        # Verify the key is in the database
        with app.app_context():
            conn = get_db_connection()
            key_row = conn.execute("SELECT * FROM keys WHERE id = ?", (key_id,)).fetchone()
            self.assertIsNotNone(key_row)
            self.assertEqual(key_row['name'], "Test RSA Key")
            
            crypto_row = conn.execute("SELECT * FROM crypto_keys WHERE asset_id = ?", (key_id,)).fetchone()
            self.assertIsNotNone(crypto_row['private_key_pem'])
            self.assertIsNotNone(crypto_row['public_key_pem'])
            conn.close()
            
```

* Load testing with `locust`

```python
import random
import string
import time
from locust import HttpUser, task, between, events

# --- Configuration ---
# The base URL of your running Flask application
HOST_URL = "http://127.0.0.1:5000"

# --- Helper Functions ---
def get_random_string(length=128):
    """Generates a random string of fixed length."""
    letters = string.ascii_lowercase + string.digits
    return ''.join(random.choice(letters) for i in range(length))

class CryptoApiUser(HttpUser):
    """
    A user class that simulates a client interacting with the crypto API.
    It will first ensure an AES key exists, then continuously test the
    encrypt and decrypt endpoints.
    """
    # Wait between 0.5 and 2 seconds between tasks
    wait_time = between(0.5, 2.0)
    host = HOST_URL

    def on_start(self):
        """
        Called when a Locust start event is triggered.
        This method ensures that a valid AES key exists for the test.
        It will try to find an existing 'AES-256' key, and if none are found,
        it will create one.
        """
        self.key_id = None
        print("Initializing user, finding or creating an AES key...")

        try:
            # 1. Fetch all existing keys
            with self.client.get("/api/keys", catch_response=True) as response:
                if not response.ok:
                    response.failure("Failed to get keys list.")
                    return
                
                keys = response.json()
                # 2. Find the first active AES-256 key
                for key in keys:
                    if key.get("type") == "AES-256" and key.get("status") == "Active":
                        self.key_id = key["id"]
                        print(f"User found existing active AES key: {self.key_id}")
                        break
            
            # 3. If no key was found, create a new one
            if not self.key_id:
                print("No active AES key found. Creating a new one for the test.")
                payload = {
                    "type": "key",
                    "name": f"perf-test-key-{int(time.time())}",
                    "keyType": "AES-256"
                }
                with self.client.post("/api/apply", json=payload, catch_response=True) as response:
                    if response.ok:
                        self.key_id = response.json().get("id")
                        print(f"User created new AES key: {self.key_id}")
                    else:
                        response.failure("Failed to create a new AES key for the test.")
                        print("Could not create key. User will be unable to run tasks.")
        
        except Exception as e:
            print(f"An exception occurred during user setup: {e}")
            # This user will not be able to proceed.
            self.key_id = None

    @task
    def encrypt_and_decrypt_flow(self):
        """
        This task simulates a full user flow:
        1. Encrypt a piece of random data.
        2. Decrypt the resulting ciphertext.
        """
        if not self.key_id:
            # If the key setup failed, we can't run the test.
            # We can skip this task for this user.
            print("Skipping task: key_id not set.")
            time.sleep(self.wait_time())
            return
            
        plaintext = get_random_string(256) # Test with 256 bytes of data
        ciphertext = None

        # --- Encrypt Task ---
        encrypt_payload = {"keyId": self.key_id, "text": plaintext}
        with self.client.post(
            "/api/crypto/encrypt",
            json=encrypt_payload,
            name="/api/crypto/encrypt",
            catch_response=True
        ) as response:
            if response.ok:
                try:
                    ciphertext = response.json().get("result")
                    if not ciphertext:
                        response.failure("Encrypt endpoint returned OK but no result.")
                except Exception:
                    response.failure("Failed to parse JSON from encrypt response.")
            else:
                response.failure(f"Encrypt request failed with status {response.status_code}")
                return # Can't proceed to decrypt if encrypt failed

        # Wait a moment before decrypting
        time.sleep(0.1) 

        # --- Decrypt Task ---
        if ciphertext:
            decrypt_payload = {"keyId": self.key_id, "text": ciphertext}
            with self.client.post(
                "/api/crypto/decrypt",
                json=decrypt_payload,
                name="/api/crypto/decrypt",
                catch_response=True
            ) as response:
                if response.ok:
                    try:
                        decrypted_text = response.json().get("result")
                        if decrypted_text != plaintext:
                            response.failure("Decryption result did not match original plaintext.")
                    except Exception:
                        response.failure("Failed to parse JSON from decrypt response.")
                else:
                    response.failure(f"Decrypt request failed with status {response.status_code}")

```


# 6. Logging and Exception Handling

Detailed logging is incredibly useful for tracing issues and debugging. Sometimes when you're running code, `print()` output won't make it back to the terminal — but with `logging` configured properly, you can actually see what's happening. Combine that with exception handling and you've got a powerful way to track down problems. Case in point: a few days ago I was processing a CISM question bank (same JSON format, same fields), but it kept failing to import into the app. After a bunch of debugging, turned out one question only had `a, b, c` options — missing the fourth one. That, plus forgetting to strip whitespace and newlines. All avoidable with better logging and error handling.

For more advanced use, you can define custom exceptions — this gives your error handling real business meaning and lets callers catch specific exception types. Also worth using: exception chaining (`raise ... from ...`) — when you catch a low-level exception and re-raise your own custom one, keeping the chain is critical for debugging the root cause.


`exception.py`
```python
class TransactionError(Exception):
    """Base class for all custom errors when handling transactions."""
    pass

class DataValidationError(TransactionError):
    """Raised when input data fails validation rules."""
    pass

class APIFailureError(TransactionError):
    """Raised when communication with an external API fails."""
    pass
```

```python
import logging
from .exceptions import APIFailureError

logger = logging.getLogger(__name__)

def send_to_payment_gateway(transaction: dict):
    """
    Simulates sending a transaction to a payment gateway.
    For demonstration: if user_id is 'api_fail', simulates a failure.
    """
    tx_id = transaction['transaction_id']
    logger.debug(f"Preparing to send transaction {tx_id} to payment gateway...")
    
    if transaction.get('user_id') == 'api_fail':
        # Simulate API call failure
        error_msg = f"Payment gateway rejected transaction {tx_id}: insufficient funds."
        logger.error(error_msg)
        raise APIFailureError(error_msg)
        
    logger.info(f"Transaction {tx_id} successfully sent to payment gateway.")
    return {"status": "success", "transaction_id": tx_id}
```

# 7. Version Management and Releases

Version management is generally done with git. In practice, some teams merge through branches, others review and commit directly to master — both are valid, though I prefer the former. Not going to go into git commands here, but a few things worth noting:

## 7.1 Files to Track or Ignore

* Files to ignore during git: `.gitignore`
* Files to ignore during Docker builds: `.dockerignore`
* Config files: `.env` or `.dev.yaml`, `.prod.yaml`
* `.github` directory: put workflow config files here for defining pipelines

During local development, configs go in `.dev.yaml` or `.env`. Even with config separation done, config files still contain sensitive info — so you need proper secrets management on top of that to actually secure your deployment configuration.

## 7.2 Infrastructure as Code (IaC)

After containerization, cloud deployment is the natural next step — and Kubernetes on the cloud is a perfect match. **Containers and cloud go hand in hand.** Two tools worth knowing: `terraform` and `ansible`. The former handles resource creation, the latter handles resource configuration. I've written about IaC on this blog before so I won't repeat it here. One thing worth calling out: don't just use `terraform` for cloud infrastructure — it can also manage `k8s`, `HashiCorp Vault`, `AAD`, and more.

# 8. Practical Tips for AI-Assisted Development

I've tried pretty much everything on the market: `cursor`, `firebase.studio`, `bolt.new`, `v0.dev`, `claude.ai`, `trae`, `chatgpt`, `grok`, `deepseek`, `kimi`, `ragflow`, `vllm`, `ollama`. Plus enterprise versions of some products like `hiagent` and `Dify`. The journey went from initial excitement to eventually recognizing the gap between design and actual delivery — the gap between a pretty UI mockup and something that actually ships. Through all the experimenting with models, services, and editors, I found one workflow that actually bridges that gap pretty well: applying AI to microservices.

Especially as models have gotten better. Before: Grok brainstorms, Gemini refines the design and outputs a new prompt, Claude writes the code. Now: Gemini does everything from brainstorming to design to prompt refinement to code generation. Before that, I was focused on prompt engineering itself — and it did produce some decent results.

But what I want to say now is that you really only need:

1. Work with 2-3 single files at a time (one backend logic file, one frontend file, one new feature demo) providing microservice APIs — implement the corresponding logic.
2. After completing each feature, write unit tests and commit with version control.
3. Start a fresh conversation and continue with steps 1 and 2 for the next feature.

Just these two simple techniques, and you can build out both the frontend and backend of a product as microservices. When you need to introduce new requirements, sketch out a quick demo to verify the logic is sound first, then integrate it back into the main codebase. Sure, you could set up code rules in cursor, but that feels heavier than necessary — this simpler approach works just fine.
