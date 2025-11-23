using System;
using System.Globalization;
using Avalonia.Data.Converters;

namespace Southville8BEdgeUI.Converters;

public static class StringConverters
{
    public static readonly IValueConverter IsNotNullOrEmpty = new IsNotNullOrEmptyConverter();
    public static readonly IValueConverter Equal = new EqualConverter();
}

public class IsNotNullOrEmptyConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        return !string.IsNullOrEmpty(value?.ToString());
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        throw new NotImplementedException();
    }
}

public class EqualConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        return value?.ToString() == parameter?.ToString();
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        throw new NotImplementedException();
    }
}
