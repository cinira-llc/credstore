# credstore

Wrapper for accessing the OS credential store in Linux, macOS, and Windows. This provides consistent access to the
native credential store, without additional authentication challenges, on various operating systems.

Supported Backends

| System       | Backend            |
|--------------|--------------------|
| Ubuntu Linux | secret-tool        |
| macOS        | security           |
| Windows      | Credential Manager |

**To retrieve a credential**
```bash
credstore get <service> <username>
```

**To delete a credential**
```bash
credstore delete <service> <username>
```

**To store a credential**
```bash
credstore set <service> <username> [password]
```
If the `[password]` argument is not provided, you will be prompted to enter it on stdin.
