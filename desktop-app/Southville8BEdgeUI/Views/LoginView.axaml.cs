using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Primitives;
using Avalonia.Media;
using Avalonia.Media.Imaging;
using Avalonia.Platform;
using Avalonia.Threading;
using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using Avalonia.Svg.Skia;
using Southville8BEdgeUI.Utils;

namespace Southville8BEdgeUI.Views;

public partial class LoginView : UserControl
{
    private readonly DispatcherTimer _autoTimer = new() { Interval = TimeSpan.FromSeconds(4) };

    public LoginView()
    {
        InitializeComponent();

        BuildCarouselFromAssets("Assets/Login");
        _autoTimer.Tick += (_, __) => AdvanceCarousel();

        this.AttachedToVisualTree += (_, __) => _autoTimer.Start();
        this.DetachedFromVisualTree += (_, __) => _autoTimer.Stop();
    }

    private void BuildCarouselFromAssets(string folder)
    {
        var asm = typeof(LoginView).Assembly.GetName().Name!;
        var baseUri = new Uri($"avares://{asm}/{folder}/");

        // Load any asset under the folder and filter by image extensions (raster + svg)
        var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            ".png", ".jpg", ".jpeg", ".webp", ".bmp", ".svg"
        };

        var uris = AssetLoader
            .GetAssets(baseUri, null)
            .Where(u => allowed.Contains(Path.GetExtension(u.AbsolutePath)))
            .OrderBy(u => u.ToString())
            .ToList();

        var slides = new List<Control>();
        foreach (var uri in uris)
        {
            try
            {
                var ext = Path.GetExtension(uri.AbsolutePath).ToLowerInvariant();
                if (ext == ".svg")
                {
                    // Use SvgSource static loader with string path (package 11.0.0.19)
                    var svgSource = SvgSource.Load(uri.ToString());
                    var svgImage = new SvgImage { Source = svgSource };
                    slides.Add(new Image
                    {
                        Source = svgImage,
                        Stretch = Stretch.Uniform,
                        HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Center,
                        VerticalAlignment = Avalonia.Layout.VerticalAlignment.Center
                    });
                }
                else
                {
                    using var stream = AssetLoader.Open(uri);
                    slides.Add(new Image
                    {
                        Source = new Bitmap(stream),
                        Stretch = Stretch.Uniform,
                        HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Center,
                        VerticalAlignment = Avalonia.Layout.VerticalAlignment.Center
                    });
                }
            }
            catch
            {
                // Ignore invalid assets
            }
        }

        // Null guard - if XAML name changes or control not initialized, exit safely
        if (LoginCarousel is null) return;

        LoginCarousel.ItemsSource = slides;
        LoginCarousel.SelectedIndex = slides.Count > 0 ? 0 : -1;

        // Build and update dots
        BuildDots();
        LoginCarousel.PropertyChanged += (_, e) =>
        {
            if (e.Property == SelectingItemsControl.SelectedIndexProperty)
            {
                UpdateDots();
            }
        };
    }

    private void BuildDots()
    {
        var dotsHost = this.FindControl<StackPanel>("CarouselDots");
        var carousel = LoginCarousel;
        if (dotsHost is null || carousel is null) return;

        dotsHost.Children.Clear();
        for (int i = 0; i < carousel.ItemCount; i++)
        {
            dotsHost.Children.Add(CreateDot(i == carousel.SelectedIndex));
        }
    }

    private void UpdateDots()
    {
        var dotsHost = this.FindControl<StackPanel>("CarouselDots");
        var carousel = LoginCarousel;
        if (dotsHost is null || carousel is null) return;

        for (int i = 0; i < dotsHost.Children.Count; i++)
        {
            if (dotsHost.Children[i] is Border dot)
            {
                var key = i == carousel.SelectedIndex ? "AccentBrush" : "BorderBrush";
                // Fallback colors preserve previous appearance if resources missing
                var fallback = i == carousel.SelectedIndex ? "#F37071" : "#D1D5DB";
                dot.Background = ThemeHelpers.GetBrush(this, key, fallback);
            }
        }
    }

    private Border CreateDot(bool active)
    {
        var key = active ? "AccentBrush" : "BorderBrush";
        var fallback = active ? "#F37071" : "#D1D5DB";
        return new Border
        {
            Width = 8,
            Height = 8,
            CornerRadius = new CornerRadius(4),
            Background = ThemeHelpers.GetBrush(this, key, fallback),
            Margin = new Thickness(4, 0, 4, 0)
        };
    }

    private void AdvanceCarousel()
    {
        var c = LoginCarousel;
        if (c is null || c.ItemCount <= 1) return;
        c.SelectedIndex = (c.SelectedIndex + 1) % c.ItemCount;
        UpdateDots();
    }
}