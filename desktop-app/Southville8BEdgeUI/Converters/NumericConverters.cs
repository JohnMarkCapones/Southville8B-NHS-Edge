using Avalonia.Data.Converters;
using System;
using System.Globalization;

namespace Southville8BEdgeUI.Converters
{
    public static class NumericConverters
    {
        public static readonly IValueConverter GreaterThanOrEqual = new GreaterThanOrEqualConverter();
        public static readonly IValueConverter LessThan = new LessThanConverter();
        public static readonly IValueConverter Between = new BetweenConverter();

        private sealed class GreaterThanOrEqualConverter : IValueConverter
        {
            public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
            {
                if (value is double d && TryParseDouble(parameter, out var threshold))
                    return d >= threshold;
                return false;
            }

            public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
                => throw new NotImplementedException();
        }

        private sealed class LessThanConverter : IValueConverter
        {
            public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
            {
                if (value is double d && TryParseDouble(parameter, out var threshold))
                    return d < threshold;
                return false;
            }

            public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
                => throw new NotImplementedException();
        }

        private sealed class BetweenConverter : IValueConverter
        {
            public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
            {
                if (value is double d && parameter is string s)
                {
                    var parts = s.Split(',');
                    if (parts.Length == 2 &&
                        double.TryParse(parts[0], NumberStyles.Any, culture, out var min) &&
                        double.TryParse(parts[1], NumberStyles.Any, culture, out var max))
                    {
                        return d >= min && d <= max;
                    }
                }
                return false;
            }

            public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
                => throw new NotImplementedException();
        }

        private static bool TryParseDouble(object? parameter, out double value)
        {
            if (parameter is string s && double.TryParse(s, NumberStyles.Any, CultureInfo.InvariantCulture, out value))
                return true;
            value = 0;
            return false;
        }
    }
}