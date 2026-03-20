---
name: golang
description: Golang style guide and best practices
---

# Golang Skills

Refactor and style the code according to the Golang style guide and best practices below.

## Style Guide

- Use the correct type for the variable. Example: `var name string` instead of `var name = "John"`.
- Always spot duplicated code and extract it to a shared function.

### Always use one line error

```go

// Do this
if err := someFunction(); err != nil {
  return err
}

// or

if _, err := someFunction(); err != nil {
  return err
}

// Don't do this
err := someFunction()
if err != nil {
  return err
}

_, err := someFunction()
if err != nil {
  return err
}
```

### Avoid using operators in code as much as possible, use functions instead. Example: `str.IsEqual` instead of `==`.

```go
// Do this
if str.IsEqual(name, "John") {
  return fmt.Errorf("name is not John")
}

// Don't do this
if name == "John" {
  return fmt.Errorf("name is not John")
}
```

### Move all models' query functions, like those in `repo.go` back to the model itself. Extend and add functions to it

```go
// Do this
func (r *UserRepo) GetByID(ctx context.Context, id string) (*models.Users, error) {
	var user models.Users
	return user.GetByID(ctx, r.db, id)
}

func (u *Users) GetByID(ctx context.Context, db *gorm.DB, id string) (*Users, error) {
	err := db.WithContext(ctx).Where("id = ?", id).First(&u).Error
	if err != nil {
		return nil, err
	}
	return u, nil
}

// Don't do this
func (r *UserRepo) GetByID(ctx context.Context, id string) (*models.Users, error) {
	var user models.Users
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}
```