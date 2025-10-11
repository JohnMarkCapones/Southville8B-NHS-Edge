using Avalonia.Controls;
using Avalonia;
using Avalonia.Media.Imaging;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Threading.Tasks;
using System.Windows.Input;

namespace Southville8BEdgeUI.ViewModels
{
    public partial class TitleBarViewModel : ViewModelBase
    {
        private Window? _window;

        [ObservableProperty]
        private string? _title;

        [ObservableProperty]
        private Bitmap? _icon;

        [ObservableProperty]
        private bool _isMaximized;

        public IAsyncRelayCommand MinimizeCommand { get; }
        public ICommand MaximizeRestoreCommand { get; }
        public ICommand CloseCommand { get; }

        public TitleBarViewModel()
        {
            MinimizeCommand = new AsyncRelayCommand(MinimizeAsync);
            MaximizeRestoreCommand = new RelayCommand(MaximizeRestore);
            CloseCommand = new RelayCommand(Close);
        }

        public void SetWindow(Window? window)
        {
            if (_window != null)
            {
                _window.PropertyChanged -= Window_PropertyChanged;
            }
            _window = window;
            if (_window != null)
            {
                Title = _window.Title;
                IsMaximized = _window.WindowState == WindowState.Maximized;
                _window.PropertyChanged += Window_PropertyChanged;
            }
        }

        private void Window_PropertyChanged(object? sender, AvaloniaPropertyChangedEventArgs e)
        {
            if (e.Property == Window.WindowStateProperty && sender is Window w)
            {
                IsMaximized = w.WindowState == WindowState.Maximized;
            }
        }

        private async Task MinimizeAsync()
        {
            if (_window == null) return;
            var target = _window;
            double steps = 8;
            for (int i = 0; i < steps; i++)
            {
                target.Opacity = 1 - (i + 1) / steps;
                await Task.Delay(15);
            }
            target.WindowState = WindowState.Minimized;
            target.Opacity = 1; // reset for restore
        }

        private void MaximizeRestore()
        {
            if (_window == null) return;
            _window.WindowState = _window.WindowState == WindowState.Maximized ? WindowState.Normal : WindowState.Maximized;
        }

        private void Close()
        {
            _window?.Close();
        }
    }
}
