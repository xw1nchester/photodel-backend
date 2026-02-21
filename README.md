Накатить миграции:
```bash
npm run migration:run
```

Swagger:
```
http://localhost:8080/api-docs
```

Сиды:
```bash
npm run seed
```

Выдать роли пользователю:
```sql
INSERT INTO user_roles (user_id, role_id)
VALUES (<USER_ID>, <ROLE_ID>);
```

Окружение:
```bash
docker compose up -d
```