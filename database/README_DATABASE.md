# Database Documentation

此目录包含 **SportsConnect** 项目的数据库相关文件。

## Structure

- `sportsconnect.sql`: Le script SQL complet pour créer la base de données, les tables, les vues, les procédures stockées, et insérer des données de démonstration.
- `migrations/`: Dossier contenant les fichiers de migration pour les futures mises à jour de la base de données.

## Comment importer la base de données

Si vous utilisez Docker, vous pouvez exécuter la commande suivante (adaptez le chemin si nécessaire) :

```bash
cat database/sportsconnect.sql | docker exec -i sportsconnect_mysql mysql -u root -psecret
```

Ou via PowerShell :

```powershell
Get-Content database/sportsconnect.sql | docker exec -i sportsconnect_mysql mysql -u root -psecret
```
