using Avalonia.Data.Converters;
using System;
using System.Globalization;

namespace Southville8BEdgeUI.Converters
{
    public class BoolToArrowConverter : IValueConverter
    {
        public static readonly BoolToArrowConverter Instance = new();
        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            if (value is bool isPositive)
            {
                return isPositive ? "M 0 5 L 5 0 L 10 5 Z" : "M 0 0 L 5 5 L 10 0 Z";
            }
            return "M 0 0 L 5 5 L 10 0 Z";
        }

        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}