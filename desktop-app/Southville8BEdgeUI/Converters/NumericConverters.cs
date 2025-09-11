using Avalonia.Data.Converters;

namespace Southville8BEdgeUI.Converters
{
    public static class NumericConverters
    {
        public static readonly IValueConverter GreaterThanOrEqual =
            new FuncValueConverter<double, object?, bool>((value, parameter) =>
            {
                if (parameter is string paramStr && double.TryParse(paramStr, out double threshold))
                {
                    return value >= threshold;
                }
                return false;
            });

        public static readonly IValueConverter LessThan =
            new FuncValueConverter<double, object?, bool>((value, parameter) =>
            {
                if (parameter is string paramStr && double.TryParse(paramStr, out double threshold))
                {
                    return value < threshold;
                }
                return false;
            });

        public static readonly IValueConverter Between =
            new FuncValueConverter<double, object?, bool>((value, parameter) =>
            {
                if (parameter is string paramStr)
                {
                    var parts = paramStr.Split(',');
                    if (parts.Length == 2 &&
                        double.TryParse(parts[0], out double min) &&
                        double.TryParse(parts[1], out double max))
                    {
                        return value >= min && value <= max;
                    }
                }
                return false;
            });
    }
}