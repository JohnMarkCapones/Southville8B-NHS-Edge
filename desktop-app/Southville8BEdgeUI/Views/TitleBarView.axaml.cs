using Avalonia;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Interactivity;
using Southville8BEdgeUI.ViewModels;
using System;

namespace Southville8BEdgeUI.Views
{
    public partial class TitleBarView : UserControl
    {
        public TitleBarView()
        {
            InitializeComponent();
        }

        protected override void OnAttachedToVisualTree(VisualTreeAttachmentEventArgs e)
        {
            base.OnAttachedToVisualTree(e);
            if (DataContext is TitleBarViewModel vm)
            {
                vm.SetWindow(this.VisualRoot as Window);
            }
        }

        private void TitleBar_PointerPressed(object? sender, PointerPressedEventArgs e)
        {
            if (this.VisualRoot is Window window && e.GetCurrentPoint(this).Properties.IsLeftButtonPressed)
            {
                window.BeginMoveDrag(e);
            }
        }

        private void TitleBar_DoubleTapped(object? sender, TappedEventArgs e)
        {
            if (DataContext is TitleBarViewModel vm)
            {
                vm.MaximizeRestoreCommand.Execute(null);
            }
        }
    }
}
