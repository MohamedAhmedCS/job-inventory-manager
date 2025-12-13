#!/usr/bin/env pwsh

# Change to server directory
Set-Location "C:\Users\ahmed\job-inventory-manager\server"

# Create migration for Job model updates
dotnet ef migrations add UpdateJobModelAndInterviewQuestionRelationship -o Migrations

Write-Host "Migration created successfully!"
