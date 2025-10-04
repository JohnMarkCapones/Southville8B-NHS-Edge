using Avalonia.Data.Converters;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;

namespace Southville8BEdgeUI.Converters;

public sealed class CollectionHasItemsConverter : IValueConverter
{
    public static readonly CollectionHasItemsConverter Instance = new();

    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is null) return false;

        if (value is int i)
            return i > 0;

        if (value is long l)
            return l > 0;

        if (value is ICollection coll)
            return coll.Count > 0;

        if (value is IReadOnlyCollection<object> roc)
            return roc.Count > 0;

        if (value is IEnumerable enumerable)
        {
            var enumerator = enumerable.GetEnumerator();
            using (enumerator as IDisposable)
            {
                return enumerator.MoveNext();
            }
        }

        return false;
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotSupportedException();
}
