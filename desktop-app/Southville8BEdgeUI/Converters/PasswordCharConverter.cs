using Avalonia.Data.Converters;
using System;
using System.Globalization;

namespace Southville8BEdgeUI.Converters
{
    public class BoolToPasswordCharConverter : IValueConverter
    {
        public char MaskChar { get; set; } = '?';

        public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            var show = value is bool b && b;
            // When show is true, return '\0' to disable masking; otherwise return MaskChar
            return show ? '\0' : MaskChar;
        }

        public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
            => throw new NotImplementedException();
    }
}
