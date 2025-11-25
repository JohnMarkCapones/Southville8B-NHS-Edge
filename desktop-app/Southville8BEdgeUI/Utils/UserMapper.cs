using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace Southville8BEdgeUI.Utils;

public static class UserMapper
{
    /// <summary>
    /// Splits a full name into first name, last name, and optional middle name
    /// </summary>
    /// <param name="fullName">Full name to split (e.g., "John Michael Smith")</param>
    /// <returns>Tuple containing firstName, lastName, and middleName</returns>
    public static (string firstName, string lastName, string? middleName) SplitFullName(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            return (string.Empty, string.Empty, null);

        var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        
        if (parts.Length == 1)
            return (parts[0], string.Empty, null);
        
        if (parts.Length == 2)
            return (parts[0], parts[1], null);
        
        // 3 or more parts - first is firstName, last is lastName, middle are middleName
        var firstName = parts[0];
        var lastName = parts[^1];
        var middleName = string.Join(" ", parts[1..^1]);
        
        return (firstName, lastName, middleName);
    }

    /// <summary>
    /// Combines first name, last name, and optional middle name into a full name
    /// </summary>
    /// <param name="firstName">First name</param>
    /// <param name="lastName">Last name</param>
    /// <param name="middleName">Optional middle name</param>
    /// <returns>Combined full name</returns>
    public static string CombineFullName(string firstName, string lastName, string? middleName = null)
    {
        var parts = new List<string>();
        
        if (!string.IsNullOrWhiteSpace(firstName))
            parts.Add(firstName.Trim());
        
        if (!string.IsNullOrWhiteSpace(middleName))
            parts.Add(middleName.Trim());
        
        if (!string.IsNullOrWhiteSpace(lastName))
            parts.Add(lastName.Trim());
        
        return string.Join(" ", parts);
    }

    /// <summary>
    /// Generates student email from LRN ID
    /// </summary>
    /// <param name="lrnId">LRN ID</param>
    /// <returns>Student email in format: lrnId@student.local</returns>
    public static string GenerateStudentEmail(string lrnId)
    {
        if (string.IsNullOrWhiteSpace(lrnId))
            throw new ArgumentException("LRN ID cannot be null or empty", nameof(lrnId));
        
        return $"{lrnId.Trim()}@student.local";
    }

    /// <summary>
    /// Generates username from first and last name
    /// </summary>
    /// <param name="firstName">First name</param>
    /// <param name="lastName">Last name</param>
    /// <returns>Generated username (e.g., "jdoe" for "John Doe")</returns>
    public static string GenerateUsername(string firstName, string lastName)
    {
        if (string.IsNullOrWhiteSpace(firstName) || string.IsNullOrWhiteSpace(lastName))
            throw new ArgumentException("First name and last name cannot be null or empty");

        var firstInitial = firstName.Trim()[0].ToString().ToLowerInvariant();
        var lastPart = lastName.Trim().ToLowerInvariant();
        
        return $"{firstInitial}{lastPart}";
    }

    /// <summary>
    /// Validates LRN ID format
    /// </summary>
    /// <param name="lrnId">LRN ID to validate</param>
    /// <returns>True if valid LRN ID format</returns>
    public static bool IsValidLrnId(string lrnId)
    {
        if (string.IsNullOrWhiteSpace(lrnId))
            return false;
        
        // LRN should be 10-15 digits
        return Regex.IsMatch(lrnId.Trim(), @"^\d{10,15}$");
    }

    /// <summary>
    /// Validates student ID format
    /// </summary>
    /// <param name="studentId">Student ID to validate</param>
    /// <returns>True if valid student ID format</returns>
    public static bool IsValidStudentId(string studentId)
    {
        if (string.IsNullOrWhiteSpace(studentId))
            return false;
        
        // Student ID should be 5-20 characters, alphanumeric with hyphens
        return Regex.IsMatch(studentId.Trim(), @"^[A-Za-z0-9\-]{5,20}$");
    }

    /// <summary>
    /// Validates phone number format
    /// </summary>
    /// <param name="phoneNumber">Phone number to validate</param>
    /// <returns>True if valid phone number format</returns>
    public static bool IsValidPhoneNumber(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return false;
        
        // International phone number format
        return Regex.IsMatch(phoneNumber.Trim(), @"^\+?[1-9]\d{1,14}$");
    }
}
