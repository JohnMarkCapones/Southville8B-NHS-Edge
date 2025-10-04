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
                if (!TryParseDouble(value, out var numeric)) return false;
                if (!TryParseDouble(parameter, out var threshold)) return false;
                return numeric >= threshold;
            }

            public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
                => throw new NotImplementedException();
        }

        private sealed class LessThanConverter : IValueConverter
        {
            public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
            {
                if (!TryParseDouble(value, out var numeric)) return false;
                if (!TryParseDouble(parameter, out var threshold)) return false;
                return numeric < threshold;
            }

            public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
                => throw new NotImplementedException();
        }

        private sealed class BetweenConverter : IValueConverter
        {
            // Accept parameter as "min|max" or "min,max" or "min;max" (whitespace ignored)
            private static readonly char[] _delims = ['|', ',', ';'];
            public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
            {
                if (!TryParseDouble(value, out var numeric)) return false;
                if (parameter is not string s) return false;
                var parts = s.Split(_delims, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                if (parts.Length != 2) return false;
                if (!double.TryParse(parts[0], NumberStyles.Any, CultureInfo.InvariantCulture, out var min)) return false;
                if (!double.TryParse(parts[1], NumberStyles.Any, CultureInfo.InvariantCulture, out var max)) return false;
                // If min > max swap (be permissive)
                if (min > max) (min, max) = (max, min);
                return numeric >= min && numeric <= max;
            }

            public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
                => throw new NotImplementedException();
        }

        private static bool TryParseDouble(object? obj, out double value)
        {
            switch (obj)
            {
                case null:
                    value = 0; return false;
                case double d:
                    value = d; return true;
                case float f:
                    value = f; return true;
                case int i:
                    value = i; return true;
                case long l:
                    value = l; return true;
                case decimal m:
                    value = (double)m; return true;
                case short s16:
                    value = s16; return true;
                case byte b:
                    value = b; return true;
                case string s when double.TryParse(s, NumberStyles.Any, CultureInfo.InvariantCulture, out var v):
                    value = v; return true;
                default:
                    value = 0; return false;
            }
        }
    }
}