using System;
using System.Globalization;
using Avalonia.Data.Converters;
using Avalonia.Media;

namespace Southville8BEdgeUI.Converters
{
    public class BoolToArrowConverter : IValueConverter
    {
        private const string UpArrowPath = "M0 5 L5 0 L10 5 Z";
        private const string DownArrowPath = "M0 0 L5 5 L10 0 Z";

        public static readonly BoolToArrowConverter Instance = new();

        public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            if (value is bool isPositive)
            {
                return StreamGeometry.Parse(isPositive ? UpArrowPath : DownArrowPath);
            }
            return null;
        }

        public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}