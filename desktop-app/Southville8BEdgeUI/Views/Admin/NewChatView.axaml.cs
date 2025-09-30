using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Windows.Input;
using Southville8BEdgeUI.ViewModels.Admin;

namespace Southville8BEdgeUI.Views.Admin;

public partial class NewChatView : UserControl
{
    public IRelayCommand RemoveParticipantUiCommand { get; }

    public NewChatView()
    {
        RemoveParticipantUiCommand = new RelayCommand<object?>(OnRemoveParticipant);
        InitializeComponent();
    }

    private void OnRemoveParticipant(object? param)
    {
        if (param is NewChatViewModel.UserOption user && DataContext is NewChatViewModel vm)
        {
            vm.RemoveParticipantCommand.Execute(user);
        }
    }

    private void InitializeComponent() => AvaloniaXamlLoader.Load(this);
}