using Avalonia.Controls;
using Avalonia;
using Avalonia.Layout;
using System;
using System.Collections.Generic;
using System.Linq;
using Southville8BEdgeUI.ViewModels.Admin;

namespace Southville8BEdgeUI.Views.Admin;

public partial class ChatView : UserControl
{
    private const double TabletBreakpoint = 1024;
    private const double MobileBreakpoint = 768;
    
    // Responsive class name constants for consistency
    private const string MobileClass = "mobile";
    private const string TabletClass = "tablet";
    private const string DesktopClass = "desktop";
    
    // Collections to store elements that need responsive behavior
    private readonly List<Control> _responsiveTextElements = new();
    private readonly List<Control> _responsiveCardElements = new();
    private readonly List<Control> _responsiveButtonElements = new();
    private readonly List<Control> _responsiveInputElements = new();
    
    // Element identification constants for optimized performance
    private const string TextElementSuffix = "Text";
    private const string ButtonElementSuffix = "Button";
    private const string InputElementSuffix = "Input";
    private const string ConversationItemClass = "conversation-item";
    private const string MessageBubbleClass = "message-bubble";

    // Cache for performance optimization
    private string _lastSizeClass = "";
    
    // Mobile navigation state
    private bool _isMobileViewInChatMode = false;

    public ChatView()
    {
        InitializeComponent();
        DataContext = new ChatViewModel();
        
        // Store references to elements that need responsive behavior
        InitializeResponsiveElements();
        
        // Set up size change handler
        this.SizeChanged += OnSizeChanged;
        
        // Subscribe to conversation selection changes for mobile navigation
        if (DataContext is ChatViewModel viewModel)
        {
            viewModel.PropertyChanged += ViewModel_PropertyChanged;
        }
    }

    // Add this method to automatically scroll to bottom when new messages arrive
    private void ScrollToBottomOfMessages()
    {
        if (MessagesScrollViewer != null && _lastSizeClass != null)
        {
            // Use dispatcher to ensure UI has updated before scrolling
            Avalonia.Threading.Dispatcher.UIThread.Post(() =>
            {
                MessagesScrollViewer.ScrollToEnd();
            }, Avalonia.Threading.DispatcherPriority.Background);
        }
    }

    // Update the ViewModel_PropertyChanged method to include auto-scroll
    private void ViewModel_PropertyChanged(object? sender, System.ComponentModel.PropertyChangedEventArgs e)
    {
        if (e.PropertyName == nameof(ChatViewModel.SelectedConversation) && _lastSizeClass != DesktopClass)
        {
            // On mobile/tablet, navigate to chat when conversation is selected (even if it's the same one)
            var viewModel = DataContext as ChatViewModel;
            if (viewModel?.SelectedConversation != null && !_isMobileViewInChatMode)
            {
                NavigateToChat();
                // Auto-scroll to bottom when conversation is opened
                ScrollToBottomOfMessages();
            }
        }
        
        // Auto-scroll to bottom when new messages are added
        if (e.PropertyName == nameof(ChatViewModel.SelectedConversation) && DataContext is ChatViewModel vm && vm.SelectedConversation != null)
        {
            // Subscribe to messages collection changes
            vm.SelectedConversation.Messages.CollectionChanged += Messages_CollectionChanged;
        }
    }

    private void Messages_CollectionChanged(object? sender, System.Collections.Specialized.NotifyCollectionChangedEventArgs e)
    {
        if (e.Action == System.Collections.Specialized.NotifyCollectionChangedAction.Add)
        {
            // Auto-scroll to bottom when new messages are added
            ScrollToBottomOfMessages();
        }
    }

    private void InitializeResponsiveElements()
    {
        // Add all named text elements that need responsive font sizes
        _responsiveTextElements.AddRange([
            ConversationsHeaderText,
            ConversationsSubtitleText,
            ChatHeaderNameText,
            ChatHeaderRoleText,
            NoConversationTitleText,
            NoConversationSubtitleText,
            NoMessagesText
        ]);

        // Add card elements
        _responsiveCardElements.AddRange([
            ConversationsCard,
            ChatCard
        ]);

        // Add button elements
        _responsiveButtonElements.AddRange([
            NewChatButton,
            BackButton,
            CallButton,
            VideoButton,
            InfoButton,
            SendButton
        ]);

        // Add input elements
        _responsiveInputElements.AddRange([
            SearchTextBox,
            UserTypeComboBox,
            MessageTextBox
        ]);
    }

    private void OnSizeChanged(object? sender, SizeChangedEventArgs e)
    {
        UpdateResponsiveClasses(e.NewSize.Width);
    }

    private void UpdateResponsiveClasses(double width)
    {
        // Determine the current breakpoint
        string sizeClass = GetSizeClass(width);
        
        // Performance optimization: Skip update if size class hasn't changed
        if (sizeClass == _lastSizeClass)
            return;
            
        _lastSizeClass = sizeClass;
        
        // Reset mobile navigation state when switching to desktop
        if (sizeClass == DesktopClass)
        {
            _isMobileViewInChatMode = false;
        }
        
        // Update all responsive elements
        UpdateMainContainerClasses(sizeClass);
        UpdateElementClasses(_responsiveTextElements, sizeClass);
        UpdateElementClasses(_responsiveCardElements, sizeClass);
        UpdateElementClasses(_responsiveButtonElements, sizeClass);
        UpdateElementClasses(_responsiveInputElements, sizeClass);
        
        // Update layout-specific elements based on screen size
        ApplyLayoutStrategy(sizeClass, width);
        
        // Update conversation and message elements dynamically
        UpdateChatElements(sizeClass);
    }

    private string GetSizeClass(double width)
    {
        if (width < MobileBreakpoint)
            return MobileClass;
        else if (width < TabletBreakpoint)
            return TabletClass;
        else
            return DesktopClass;
    }

    private void UpdateMainContainerClasses(string sizeClass)
    {
        // Clear existing responsive classes using constants
        MainGrid.Classes.Remove("main-content");
        MainGrid.Classes.Remove("main-content-tablet");
        MainGrid.Classes.Remove("main-content-mobile");
        
        // Add appropriate class
        switch (sizeClass)
        {
            case MobileClass:
                MainGrid.Classes.Add("main-content-mobile");
                break;
            case TabletClass:
                MainGrid.Classes.Add("main-content-tablet");
                break;
            default:
                MainGrid.Classes.Add("main-content");
                break;
        }
    }

    private void UpdateElementClasses(List<Control> elements, string sizeClass)
    {
        foreach (var element in elements)
        {
            // Remove existing responsive classes using constants
            element.Classes.Remove(MobileClass);
            element.Classes.Remove(TabletClass);
            
            // Add appropriate responsive class
            if (sizeClass != DesktopClass)
            {
                element.Classes.Add(sizeClass);
            }
        }
    }

    private void ApplyLayoutStrategy(string sizeClass, double width)
    {
        // Create a layout configuration based on the screen size
        var layoutConfig = CreateLayoutConfig(sizeClass);
        
        // Apply the layout configuration
        ApplyMainGridLayout(layoutConfig);
        ApplyChatHeaderLayout(layoutConfig);
        ApplyMessageInputLayout(layoutConfig);
    }

    private LayoutConfiguration CreateLayoutConfig(string sizeClass)
    {
        return sizeClass switch
        {
            MobileClass => new LayoutConfiguration
            {
                MainGridColumns = 1,
                ConversationsCardVisible = !_isMobileViewInChatMode,
                ChatCardVisible = _isMobileViewInChatMode,
                ConversationsCardMargin = new Thickness(12),
                ChatCardMargin = new Thickness(12),
                ConversationsHeaderPadding = new Thickness(16),
                ChatHeaderPadding = new Thickness(16),
                ChatHeaderButtonsOrientation = Orientation.Horizontal,
                MessageInputOrientation = Orientation.Vertical,
                MessageInputSpacing = 8,
                SearchFilterOrientation = Orientation.Vertical,
                SearchFilterSpacing = 8,
                ShowBackButton = true
            },
            
            TabletClass => new LayoutConfiguration
            {
                MainGridColumns = 1,
                ConversationsCardVisible = !_isMobileViewInChatMode,
                ChatCardVisible = _isMobileViewInChatMode,
                ConversationsCardMargin = new Thickness(16),
                ChatCardMargin = new Thickness(16),
                ConversationsHeaderPadding = new Thickness(20, 20, 20, 16),
                ChatHeaderPadding = new Thickness(20),
                ChatHeaderButtonsOrientation = Orientation.Horizontal,
                MessageInputOrientation = Orientation.Horizontal,
                MessageInputSpacing = 12,
                SearchFilterOrientation = Orientation.Vertical,
                SearchFilterSpacing = 12,
                ShowBackButton = true
            },
            
            _ => new LayoutConfiguration // Desktop
            {
                MainGridColumns = 2,
                ConversationsCardVisible = true,
                ChatCardVisible = true,
                ConversationsCardMargin = new Thickness(24, 24, 12, 24),
                ChatCardMargin = new Thickness(12, 24, 24, 24),
                ConversationsHeaderPadding = new Thickness(20, 20, 20, 16),
                ChatHeaderPadding = new Thickness(20),
                ChatHeaderButtonsOrientation = Orientation.Horizontal,
                MessageInputOrientation = Orientation.Horizontal,
                MessageInputSpacing = 12,
                SearchFilterOrientation = Orientation.Vertical,
                SearchFilterSpacing = 12,
                ShowBackButton = false
            }
        };
    }

    private void ApplyMainGridLayout(LayoutConfiguration config)
    {
        MainGrid.ColumnDefinitions.Clear();
        
        if (config.MainGridColumns == 1)
        {
            MainGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            
            // On mobile/tablet, show conversations or chat based on navigation state
            ConversationsCard.IsVisible = config.ConversationsCardVisible;
            ChatCard.IsVisible = config.ChatCardVisible;
            
            // Position both cards in the same column
            Grid.SetColumn(ConversationsCard, 0);
            Grid.SetColumn(ChatCard, 0);
        }
        else
        {
            MainGrid.ColumnDefinitions.Add(new ColumnDefinition(new GridLength(360)));
            MainGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            
            ConversationsCard.IsVisible = true;
            ChatCard.IsVisible = true;
            
            Grid.SetColumn(ConversationsCard, 0);
            Grid.SetColumn(ChatCard, 1);
        }
        
        // Update margins
        ConversationsCard.Margin = config.ConversationsCardMargin;
        ChatCard.Margin = config.ChatCardMargin;
        
        // Show/hide back button based on configuration
        BackButton.IsVisible = config.ShowBackButton;
    }

    private void ApplyChatHeaderLayout(LayoutConfiguration config)
    {
        ConversationsHeader.Padding = config.ConversationsHeaderPadding;
        ChatHeader.Padding = config.ChatHeaderPadding;
        
        ChatHeaderButtons.Orientation = config.ChatHeaderButtonsOrientation;
        
        if (config.ChatHeaderButtonsOrientation == Orientation.Vertical)
        {
            ChatHeaderButtons.HorizontalAlignment = HorizontalAlignment.Stretch;
        }
        else
        {
            ChatHeaderButtons.HorizontalAlignment = HorizontalAlignment.Right;
        }
    }

    private void ApplyMessageInputLayout(LayoutConfiguration config)
    {
        MessageInputGrid.ColumnDefinitions.Clear();
        MessageInputGrid.RowDefinitions.Clear();
        
        if (config.MessageInputOrientation == Orientation.Vertical)
        {
            MessageInputGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            MessageInputGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            MessageInputGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            
            Grid.SetColumn(MessageTextBox, 0);
            Grid.SetRow(MessageTextBox, 0);
            Grid.SetColumn(SendButton, 0);
            Grid.SetRow(SendButton, 1);
            
            MessageTextBox.Margin = new Thickness(0, 0, 0, config.MessageInputSpacing);
            SendButton.HorizontalAlignment = HorizontalAlignment.Stretch;
        }
        else
        {
            MessageInputGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
            MessageInputGrid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Auto));
            MessageInputGrid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            
            Grid.SetColumn(MessageTextBox, 0);
            Grid.SetRow(MessageTextBox, 0);
            Grid.SetColumn(SendButton, 1);
            Grid.SetRow(SendButton, 0);
            
            MessageTextBox.Margin = new Thickness(0, 0, config.MessageInputSpacing, 0);
            SendButton.HorizontalAlignment = HorizontalAlignment.Center;
        }
    }

    private void UpdateChatElements(string sizeClass)
    {
        // Optimized: Only update if there are visible elements
        if (ConversationsCard?.IsVisible == true)
        {
            UpdateChatElementsRecursively(ConversationsCard, sizeClass);
        }
        
        if (ChatCard?.IsVisible == true)
        {
            UpdateChatElementsRecursively(ChatCard, sizeClass);
        }
    }

    private void UpdateChatElementsRecursively(Control control, string sizeClass)
    {
        // Improved pattern matching with null safety and performance optimization
        // Fast path for conversation items
        if (control is Button conversationItem && conversationItem.Classes.Contains(ConversationItemClass))
        {
            UpdateElementResponsiveClasses(conversationItem, sizeClass);
        }
        // Fast path for message bubbles
        else if (control is Border messageBubble && messageBubble.Classes.Contains(MessageBubbleClass))
        {
            UpdateElementResponsiveClasses(messageBubble, sizeClass);
        }
        // Optimized text block check using direct string comparison
        else if (control is TextBlock textBlock && textBlock.Name != null && textBlock.Name.EndsWith(TextElementSuffix))
        {
            UpdateElementResponsiveClasses(textBlock, sizeClass);
        }
        // Optimized button check using direct string comparison
        else if (control is Button button && button.Name != null && button.Name.EndsWith(ButtonElementSuffix))
        {
            UpdateElementResponsiveClasses(button, sizeClass);
        }
        // Check for input elements
        else if (control.Name != null && control.Name.EndsWith(InputElementSuffix))
        {
            UpdateElementResponsiveClasses(control, sizeClass);
        }

        // Recursively update children with type-specific handling
        if (control is Panel panel)
        {
            foreach (Control child in panel.Children)
            {
                UpdateChatElementsRecursively(child, sizeClass);
            }
        }
        else if (control is ContentControl contentControl && contentControl.Content is Control contentChild)
        {
            UpdateChatElementsRecursively(contentChild, sizeClass);
        }
        // Note: ItemsControl children are handled through the template
    }
    
    private void UpdateElementResponsiveClasses(Control element, string sizeClass)
    {
        // Remove existing responsive classes using constants
        element.Classes.Remove(MobileClass);
        element.Classes.Remove(TabletClass);
        
        // Add appropriate responsive class
        if (sizeClass != DesktopClass)
        {
            element.Classes.Add(sizeClass);
        }
    }

    // Mobile navigation methods
    private void NavigateToChat()
    {
        if (_lastSizeClass == DesktopClass) return; // Don't navigate on desktop
        
        _isMobileViewInChatMode = true;
        ApplyLayoutStrategy(_lastSizeClass, Bounds.Width);
    }

    private void NavigateToConversations()
    {
        if (_lastSizeClass == DesktopClass) return; // Don't navigate on desktop
        
        _isMobileViewInChatMode = false;
        
        // **ALTERNATIVE FIX: Instead of setting to null, keep the selection but allow re-selection**
        // This prevents binding errors while still allowing the same conversation to be opened again
        
        ApplyLayoutStrategy(_lastSizeClass, Bounds.Width);
    }

    // Event handlers for navigation
    private void BackButton_Click(object? sender, Avalonia.Interactivity.RoutedEventArgs e)
    {
        NavigateToConversations();
    }

    protected override void OnAttachedToVisualTree(VisualTreeAttachmentEventArgs e)
    {
        base.OnAttachedToVisualTree(e);
        
        // Set up back button click handler
        BackButton.Click += BackButton_Click;
        
        // Initial responsive setup
        if (Bounds.Width > 0)
        {
            UpdateResponsiveClasses(Bounds.Width);
        }
    }

    protected override void OnDetachedFromVisualTree(VisualTreeAttachmentEventArgs e)
    {
        base.OnDetachedFromVisualTree(e);
        
        // Clean up event handlers
        BackButton.Click -= BackButton_Click;
        
        if (DataContext is ChatViewModel viewModel)
        {
            viewModel.PropertyChanged -= ViewModel_PropertyChanged;
            
            // Clean up message collection subscriptions
            if (viewModel.SelectedConversation != null)
            {
                viewModel.SelectedConversation.Messages.CollectionChanged -= Messages_CollectionChanged;
            }
        }
    }
    
    // Configuration class for layout strategies
    private class LayoutConfiguration
    {
        public int MainGridColumns { get; set; }
        public bool ConversationsCardVisible { get; set; }
        public bool ChatCardVisible { get; set; }
        public Thickness ConversationsCardMargin { get; set; }
        public Thickness ChatCardMargin { get; set; }
        public Thickness ConversationsHeaderPadding { get; set; }
        public Thickness ChatHeaderPadding { get; set; }
        public Orientation ChatHeaderButtonsOrientation { get; set; }
        public Orientation MessageInputOrientation { get; set; }
        public double MessageInputSpacing { get; set; }
        public Orientation SearchFilterOrientation { get; set; }
        public double SearchFilterSpacing { get; set; }
        public bool ShowBackButton { get; set; }
    }
}