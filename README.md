Окружение:
```bash
docker compose up -d
```

Миграции:
```bash
npm run migration:run
```

Сиды (опционально):
```bash
npm run seed
```

Swagger:
```
http://localhost:8080/api-docs
```

Выдача ролей пользователям:
```sql
INSERT INTO users_roles (user_id, role_id)
VALUES (<USER_ID>, <ROLE_ID>);
```