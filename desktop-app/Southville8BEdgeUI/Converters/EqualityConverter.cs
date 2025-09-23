using System;
using System.Globalization;
using Avalonia.Data.Converters;

namespace Southville8BEdgeUI.Converters
{
    public sealed class EqualityConverter : IValueConverter
    {
        public static readonly EqualityConverter Instance = new();

        public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            return Equals(value, parameter);
        }

        public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            throw new NotSupportedException();
        }
    }
}
