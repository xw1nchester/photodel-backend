Накатить миграции:
```
npm run migration:run
```

Swagger:
```
http://localhost:8080/api-docs
```

Сиды:
```
npm run seed
```

Выдать роли пользователю:
```
INSERT INTO user_roles (user_id, role_id)
VALUES (<USER_ID>, <ROLE_ID>);
```