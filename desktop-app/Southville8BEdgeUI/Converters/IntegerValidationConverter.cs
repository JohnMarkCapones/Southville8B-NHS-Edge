using System;
using System.Globalization;
using Avalonia.Data;
using Avalonia.Data.Converters;

namespace Southville8BEdgeUI.Converters
{
    public class IntegerValidationConverter : IValueConverter
    {
        public static readonly IntegerValidationConverter Instance = new();

    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        // Convert from int? to string for display in TextBox
        if (targetType == typeof(string))
        {
            if (value is int intValue)
            {
                return intValue.ToString(culture);
            }
            if (value == null)
            {
                return string.Empty;
            }
        }
        return value;
    }

        public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            // Convert from string to int? for binding to ViewModel
            if (value is string str)
            {
                if (string.IsNullOrWhiteSpace(str))
                    return null;
                    
                if (int.TryParse(str, out int result))
                    return result;
                    
                // Return BindingNotification with custom error message
                return new BindingNotification(
                    new Exception("Please enter a valid number"), 
                    BindingErrorType.Error);
            }
            
            // If value is already an int, return it
            if (value is int intValue)
                return intValue;
                
            return value;
        }
    }
}
