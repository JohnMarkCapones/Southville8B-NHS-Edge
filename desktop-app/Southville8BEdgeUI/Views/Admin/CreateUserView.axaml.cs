using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using System;
using System.Collections.Generic;
using System.Linq;
using Southville8BEdgeUI.ViewModels.Admin;

namespace Southville8BEdgeUI.Views.Admin;

public partial class CreateUserView : UserControl
{
    private const double TabletBreakpoint = 1024;
    private const double MobileBreakpoint = 768;

    private readonly List<Control> _textElements = new();
    private readonly List<Control> _cardElements = new();
    private readonly List<Control> _inputElements = new();
    private readonly List<Control> _buttonElements = new();

    public CreateUserView()
    {
        InitializeComponent();
        this.SizeChanged += OnSizeChanged;
        InitializeResponsiveCollections();

        // Just-in-time password capture to avoid keeping bindings for secrets
        SaveUserButton.Click += OnSaveUserClicked;
        CancelButton.Click += (_, _) => ClearPasswordBoxes();
    }

    private void OnSaveUserClicked(object? sender, Avalonia.Interactivity.RoutedEventArgs e)
    {
        if (DataContext is not CreateUserViewModel vm) return;
        var password = (PasswordInput as TextBox)?.Text ?? string.Empty;
        var confirm = (ConfirmPasswordInput as TextBox)?.Text ?? string.Empty;

        vm.Password = password;
        vm.ConfirmPassword = confirm;

        vm.SaveUserCommand.Execute(null);

        if (!vm.HasValidationError)
        {
            ClearPasswordBoxes();
            vm.Password = string.Empty;
            vm.ConfirmPassword = string.Empty;
        }
    }

    private void ClearPasswordBoxes()
    {
        if (PasswordInput is TextBox p) p.Text = string.Empty;
        if (ConfirmPasswordInput is TextBox c) c.Text = string.Empty;
    }

    private void InitializeResponsiveCollections()
    {
        _textElements.AddRange(new Control[]
        {
            HeaderTitleText, HeaderSubtitleText,
            BasicInfoSectionTitle, CredentialsSectionTitle,
            GeneratedPasswordText, ValidationMessageText
        });
        _cardElements.AddRange(new Control[] { BasicInfoCard, CredentialsCard });
        _inputElements.AddRange(new Control[]
        {
            FullNameInput, UsernameInput, EmailInput, PhoneInput,
            RoleCombo, StatusCombo, GradeDeptCombo,
            PasswordInput, ConfirmPasswordInput
        });
        _buttonElements.AddRange(new Control[]
        {
            BackButton, GeneratePasswordButton, SaveUserButton, CancelButton
        });
    }

    private void OnSizeChanged(object? sender, SizeChangedEventArgs e) => ApplyResponsive(e.NewSize.Width);

    private void ApplyResponsive(double width)
    {
        string sizeClass = width < MobileBreakpoint ? "mobile" : width < TabletBreakpoint ? "tablet" : "desktop";
        UpdateMainContainer(sizeClass);
        UpdateClasses(_textElements, sizeClass);
        UpdateClasses(_cardElements, sizeClass);
        UpdateClasses(_inputElements, sizeClass);
        UpdateClasses(_buttonElements, sizeClass);
        UpdateGrids(sizeClass);
    }

    private void UpdateMainContainer(string sizeClass)
    {
        MainStackPanel.Classes.Remove("main-content");
        MainStackPanel.Classes.Remove("main-content.tablet");
        MainStackPanel.Classes.Remove("main-content.mobile");
        MainStackPanel.Classes.Remove("main-content_tablet");
        MainStackPanel.Classes.Remove("main-content_mobile");
        switch (sizeClass)
        {
            case "mobile":
                MainStackPanel.Classes.Add("main-content");
                MainStackPanel.Classes.Add("mobile");
                break;
            case "tablet":
                MainStackPanel.Classes.Add("main-content");
                MainStackPanel.Classes.Add("tablet");
                break;
            default:
                MainStackPanel.Classes.Add("main-content");
                break;
        }
    }

    private void UpdateClasses(IEnumerable<Control> controls, string sizeClass)
    {
        foreach (var c in controls)
        {
            c.Classes.Remove("mobile");
            c.Classes.Remove("tablet");
            if (sizeClass != "desktop") c.Classes.Add(sizeClass);
        }
    }

    private void UpdateGrids(string sizeClass)
    {
        // Basic info grid
        if (sizeClass == "mobile")
        {
            BasicInfoGrid.ColumnDefinitions.Clear();
            BasicInfoGrid.RowDefinitions.Clear();
            BasicInfoGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            BasicInfoGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            BasicInfoGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            var stacks = BasicInfoGrid.Children.OfType<StackPanel>().Take(2).ToArray();
            if (stacks.Length < 2) return; // insufficient children, abort layout changes
            var left = stacks[0];
            var right = stacks[1];
            Grid.SetColumn(left, 0); Grid.SetRow(left, 0); left.Margin = new Thickness(0,0,0,12);
            Grid.SetColumn(right, 0); Grid.SetRow(right, 1); right.Margin = new Thickness(0,12,0,0);
        }
        else
        {
            BasicInfoGrid.ColumnDefinitions.Clear();
            BasicInfoGrid.RowDefinitions.Clear();
            BasicInfoGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            BasicInfoGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            var stacks = BasicInfoGrid.Children.OfType<StackPanel>().Take(2).ToArray();
            if (stacks.Length < 2) return;
            var left = stacks[0];
            var right = stacks[1];
            Grid.SetColumn(left, 0); Grid.SetRow(left, 0); left.Margin = new Thickness(0,0,28,0);
            Grid.SetColumn(right, 1); Grid.SetRow(right, 0); right.Margin = new Thickness(0);
        }

        // Credentials grid
        if (sizeClass == "mobile")
        {
            CredentialsGrid.ColumnDefinitions.Clear();
            CredentialsGrid.RowDefinitions.Clear();
            CredentialsGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            CredentialsGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            CredentialsGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            var stacks = CredentialsGrid.Children.OfType<StackPanel>().Take(2).ToArray();
            if (stacks.Length < 2) return;
            var first = stacks[0];
            var second = stacks[1];
            Grid.SetColumn(first, 0); Grid.SetRow(first, 0); first.Margin = new Thickness(0,0,0,12);
            Grid.SetColumn(second, 0); Grid.SetRow(second, 1); second.Margin = new Thickness(0,12,0,0);

            ActionsGrid.ColumnDefinitions.Clear();
            ActionsGrid.RowDefinitions.Clear();
            ActionsGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
            ActionsGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            ActionsGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            Grid.SetColumn(SaveUserButton,0); Grid.SetRow(SaveUserButton,0);
            Grid.SetColumn(CancelButton,0); Grid.SetRow(CancelButton,1); CancelButton.Margin = new Thickness(0,12,0,0);
        }
        else
        {
            CredentialsGrid.ColumnDefinitions.Clear();
            CredentialsGrid.RowDefinitions.Clear();
            CredentialsGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            CredentialsGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            var stacks = CredentialsGrid.Children.OfType<StackPanel>().Take(2).ToArray();
            if (stacks.Length < 2) return;
            var first = stacks[0];
            var second = stacks[1];
            Grid.SetColumn(first, 0); Grid.SetRow(first, 0); first.Margin = new Thickness(0,0,28,0);
            Grid.SetColumn(second, 1); Grid.SetRow(second, 0); second.Margin = new Thickness(0);

            ActionsGrid.RowDefinitions.Clear();
            ActionsGrid.ColumnDefinitions.Clear();
            ActionsGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
            ActionsGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
            Grid.SetColumn(SaveUserButton,0); Grid.SetRow(SaveUserButton,0);
            Grid.SetColumn(CancelButton,1); Grid.SetRow(CancelButton,0); CancelButton.Margin = new Thickness(16,0,0,0);
        }
    }
}