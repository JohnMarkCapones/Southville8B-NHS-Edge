using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Collections.ObjectModel;
using System.Linq;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class HelpGuideViewModel : ViewModelBase
{
    [ObservableProperty]
    private ObservableCollection<HelpCategoryViewModel> _helpCategories = new();

    [ObservableProperty]
    private string _searchText = string.Empty;

    [ObservableProperty]
    private HelpCategoryViewModel? _selectedCategory;

    public HelpGuideViewModel()
    {
        InitializeHelpCategories();
        // Set default selected category to prevent null binding errors
        SelectedCategory = HelpCategories.FirstOrDefault();
    }

    private void InitializeHelpCategories()
    {
        HelpCategories.Add(new HelpCategoryViewModel
        {
            Title = "Getting Started",
            Description = "Basic information to get you started with the system",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new() { Title = "System Overview", Content = "Introduction to the admin portal..." },
                new() { Title = "First Login", Content = "Steps to log in for the first time..." },
                new() { Title = "Navigation Guide", Content = "How to navigate through the system..." }
            }
        });

        HelpCategories.Add(new HelpCategoryViewModel
        {
            Title = "User Management",
            Description = "Managing users, roles, and permissions",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new() { Title = "Adding New Users", Content = "How to add new users to the system..." },
                new() { Title = "Role Management", Content = "Managing user roles and permissions..." },
                new() { Title = "User Deactivation", Content = "How to deactivate user accounts..." }
            }
        });

        HelpCategories.Add(new HelpCategoryViewModel
        {
            Title = "System Settings",
            Description = "Configuring system settings and preferences",
            Articles = new ObservableCollection<HelpArticleViewModel>
            {
                new() { Title = "General Settings", Content = "Configuring general system settings..." },
                new() { Title = "Security Settings", Content = "Managing security configurations..." },
                new() { Title = "Backup Configuration", Content = "Setting up automated backups..." }
            }
        });
    }

    [RelayCommand]
    private void SearchHelp()
    {
        // TODO: Implement search functionality
    }

    [RelayCommand]
    private void SelectCategory(HelpCategoryViewModel category)
    {
        SelectedCategory = category;
    }

    [RelayCommand]
    private void ContactSupport()
    {
        // TODO: Implement contact support functionality
    }
}

public partial class HelpCategoryViewModel : ObservableObject
{
    [ObservableProperty]
    private string _title = string.Empty;

    [ObservableProperty]
    private string _description = string.Empty;

    [ObservableProperty]
    private ObservableCollection<HelpArticleViewModel> _articles = new();
}

public partial class HelpArticleViewModel : ObservableObject
{
    [ObservableProperty]
    private string _title = string.Empty;

    [ObservableProperty]
    private string _content = string.Empty;
}