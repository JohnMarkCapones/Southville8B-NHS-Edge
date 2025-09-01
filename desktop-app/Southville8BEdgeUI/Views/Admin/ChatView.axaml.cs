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
    
    // Significant width change threshold for responsive updates
    private const double SignificantWidthChangeThreshold = 50;
    
    // Responsive class name constants for consistency
    private const string MobileClass = "mobile";
    private const string TabletClass = "tablet";
    private const string DesktopClass = "desktop";
    
    // Collections to store elements that need responsive behavior
    private readonly List<Control> _responsiveTextElements = new();
    private readonly List<Control> _responsiveCardElements = new();
    private readonly List<Control> _responsiveButtonElements = new();
    private readonly List<Control> _responsiveInputElements = new();
    
    // Cache for targeted UI element updates
    private readonly List<Control> _cachedChatElements = new();
    
    // Element identification constants for optimized performance
    private const string TextElementSuffix = "Text";
    private const string ButtonElementSuffix = "Button";
    private const string InputElementSuffix = "Input";
    private const string ConversationItemClass = "conversation-item";
    private const string MessageBubbleClass = "message-bubble";

    // Cache for performance optimization
    private string _lastSizeClass = "";
    private double _lastWidth = 0;
    
    // Mobile navigation state
    private bool _isMobileViewInChatMode = false;
    
    // Track message collection subscriptions to prevent memory leaks
    private ChatConversationViewModel? _currentSubscribedConversation = null;
    
    // Debouncing for scroll operations
    private bool _isScrollScheduled = false;
    
    // Visibility state tracking for efficient cache management
    private bool _lastConversationsCardVisible = false;
    private bool _lastChatCardVisible = false;
    
    // Recursion depth limit for UI traversal safety
    private const int MaxRecursionDepth = 10;

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

    // Improved scroll method allowing initial scrolling before size class is set
    private void ScrollToBottomOfMessages()
    {
        if (MessagesScrollViewer != null && !_isScrollScheduled)
        {
            _isScrollScheduled = true;
            
            // Use dispatcher to ensure UI has updated before scrolling
            Avalonia.Threading.Dispatcher.UIThread.Post(() =>
            {
                try
                {
                    MessagesScrollViewer.ScrollToEnd();
                }
                finally
                {
                    _isScrollScheduled = false;
                }
            }, Avalonia.Threading.DispatcherPriority.Background);
        }
    }

    // Update the ViewModel_PropertyChanged method to handle message subscriptions only
    private void ViewModel_PropertyChanged(object? sender, System.ComponentModel.PropertyChangedEventArgs e)
    {
        // Handle message collection subscription changes properly to prevent memory leaks
        if (e.PropertyName == nameof(ChatViewModel.SelectedConversation) && DataContext is ChatViewModel vm)
        {
            // Unsubscribe from previous conversation's messages with null safety
            if (_currentSubscribedConversation?.Messages != null)
            {
                _currentSubscribedConversation.Messages.CollectionChanged -= Messages_CollectionChanged;
            }
            
            // Subscribe to new conversation's messages with null safety
            if (vm.SelectedConversation?.Messages != null)
            {
                vm.SelectedConversation.Messages.CollectionChanged += Messages_CollectionChanged;
                _currentSubscribedConversation = vm.SelectedConversation;
            }
            else
            {
                _currentSubscribedConversation = null;
            }
        }
    }

    // Add event handler for conversation navigation
    private void ChatViewModel_ConversationNavigationRequested(object? sender, ConversationNavigationEventArgs e)
    {
        if (_lastSizeClass == DesktopClass) return; // Don't handle navigation on desktop
        
        switch (e.NavigationType)
        {
            case ConversationNavigationType.OpenChat:
                if (e.Conversation != null && !_isMobileViewInChatMode)
                {
                    NavigateToChat();
                    // Auto-scroll to bottom when conversation is opened
                    ScrollToBottomOfMessages();
                }
                break;
                
            case ConversationNavigationType.BackToConversations:
                NavigateToConversations();
                break;
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
        _responsiveTextElements.AddRange(new Control[]
        {
            ConversationsHeaderText,
            ConversationsSubtitleText,
            ChatHeaderNameText,
            ChatHeaderRoleText,
            NoConversationTitleText,
            NoConversationSubtitleText,
            NoMessagesText
        });

        // Add card elements
        _responsiveCardElements.AddRange(new Control[]
        {
            ConversationsCard,
            ChatCard
        });

        // Add button elements
        _responsiveButtonElements.AddRange(new Control[]
        {
            NewChatButton,
            BackButton,
            CallButton,
            VideoButton,
            InfoButton,
            SendButton
        });

        // Add input elements
        _responsiveInputElements.AddRange(new Control[]
        {
            SearchTextBox,
            UserTypeComboBox,
            MessageTextBox
        });
        
        // Cache chat-specific elements for targeted updates
        CacheChatElements();
        
        // Initialize visibility state tracking
        _lastConversationsCardVisible = ConversationsCard?.IsVisible ?? false;
        _lastChatCardVisible = ChatCard?.IsVisible ?? false;
    }

    // Pre-cache chat elements to avoid expensive recursive searches
    private void CacheChatElements()
    {
        _cachedChatElements.Clear();
        
        // Add elements with known classes/patterns that need responsive updates
        if (ConversationsCard != null)
        {
            FindAndCacheElementsRecursively(ConversationsCard, 0);
        }
        
        if (ChatCard != null)
        {
            FindAndCacheElementsRecursively(ChatCard, 0);
        }
    }

    // Improved recursive method with depth limiting to prevent stack overflow
    private void FindAndCacheElementsRecursively(Control control, int depth)
    {
        // Safety check: Prevent stack overflow with depth limiting
        if (depth >= MaxRecursionDepth)
        {
            return;
        }
        
        // Cache conversation items
        if (control is Button conversationItem && conversationItem.Classes.Contains(ConversationItemClass))
        {
            _cachedChatElements.Add(conversationItem);
        }
        // Cache message bubbles
        else if (control is Border messageBubble && messageBubble.Classes.Contains(MessageBubbleClass))
        {
            _cachedChatElements.Add(messageBubble);
        }
        // Cache text elements with specific suffixes
        else if (control is TextBlock textBlock && textBlock.Name != null && textBlock.Name.EndsWith(TextElementSuffix))
        {
            _cachedChatElements.Add(textBlock);
        }
        // Cache button elements with specific suffixes
        else if (control is Button button && button.Name != null && button.Name.EndsWith(ButtonElementSuffix))
        {
            _cachedChatElements.Add(button);
        }
        // Cache input elements
        else if (control.Name != null && control.Name.EndsWith(InputElementSuffix))
        {
            _cachedChatElements.Add(control);
        }

        // Recursively search children with depth tracking
        if (control is Panel panel)
        {
            foreach (Control child in panel.Children)
            {
                FindAndCacheElementsRecursively(child, depth + 1);
            }
        }
        else if (control is ContentControl contentControl && contentControl.Content is Control contentChild)
        {
            FindAndCacheElementsRecursively(contentChild, depth + 1);
        }
    }

    private void OnSizeChanged(object? sender, SizeChangedEventArgs e)
    {
        UpdateResponsiveClasses(e.NewSize.Width);
    }

    private void UpdateResponsiveClasses(double width)
    {
        // Determine the current breakpoint
        string sizeClass = GetSizeClass(width);
        
        // Check if significant changes occurred that require updates
        bool sizeClassChanged = sizeClass != _lastSizeClass;
        bool significantWidthChange = Math.Abs(width - _lastWidth) > SignificantWidthChangeThreshold;
        
        if (!sizeClassChanged && !significantWidthChange)
            return;
            
        _lastSizeClass = sizeClass;
        _lastWidth = width;
        
        // Reset mobile navigation state when switching to desktop
        if (sizeClass == DesktopClass)
        {
            _isMobileViewInChatMode = false;
        }
        
        // Only update element classes when size class changes
        if (sizeClassChanged)
        {
            // Update all responsive elements
            UpdateMainContainerClasses(sizeClass);
            UpdateElementClasses(_responsiveTextElements, sizeClass);
            UpdateElementClasses(_responsiveCardElements, sizeClass);
            UpdateElementClasses(_responsiveButtonElements, sizeClass);
            UpdateElementClasses(_responsiveInputElements, sizeClass);
            
            // Update cached chat elements for better performance
            UpdateCachedChatElements(sizeClass);
        }
        
        // Always update layout-specific elements based on actual width
        ApplyLayoutStrategy(sizeClass, width);
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

    // Optimized method using cached elements with smart cache refresh logic
    private void UpdateCachedChatElements(string sizeClass)
    {
        // Update cached elements directly instead of recursive search
        foreach (var element in _cachedChatElements)
        {
            UpdateElementResponsiveClasses(element, sizeClass);
        }
        
        // Smart cache refresh: Only refresh when visibility state actually changes
        var currentConversationsVisible = ConversationsCard?.IsVisible ?? false;
        var currentChatVisible = ChatCard?.IsVisible ?? false;
        
        if (currentConversationsVisible != _lastConversationsCardVisible || 
            currentChatVisible != _lastChatCardVisible)
        {
            // Visibility state changed, refresh cache
            CacheChatElements();
            
            // Update tracking state
            _lastConversationsCardVisible = currentConversationsVisible;
            _lastChatCardVisible = currentChatVisible;
        }
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

    /// <summary>
    /// Gets the effective width for layout calculations with proper fallback values
    /// </summary>
    /// <returns>A valid width value for layout operations</returns>
    private double GetEffectiveWidth()
    {
        // Use cached width if available and valid
        if (_lastWidth > 0)
            return _lastWidth;
            
        // Use current bounds if available
        if (Bounds.Width > 0)
            return Bounds.Width;
            
        // Fallback to mobile breakpoint - 1 to ensure mobile layout
        return MobileBreakpoint - 1;
    }

    // Mobile navigation methods with improved width handling
    private void NavigateToChat()
    {
        if (_lastSizeClass == DesktopClass) return; // Don't navigate on desktop
        
        _isMobileViewInChatMode = true;
        ApplyLayoutStrategy(_lastSizeClass, GetEffectiveWidth());
    }

    private void NavigateToConversations()
    {
        if (_lastSizeClass == DesktopClass) return; // Don't navigate on desktop
        
        _isMobileViewInChatMode = false;
        ApplyLayoutStrategy(_lastSizeClass, GetEffectiveWidth());
    }

    // Update the BackButton_Click to use ViewModel method
    private void BackButton_Click(object? sender, Avalonia.Interactivity.RoutedEventArgs e)
    {
        if (DataContext is ChatViewModel viewModel)
        {
            viewModel.RequestNavigateToConversations();
        }
        else
        {
            NavigateToConversations();
        }
    }

    protected override void OnAttachedToVisualTree(VisualTreeAttachmentEventArgs e)
    {
        base.OnAttachedToVisualTree(e);
        
        // Set up back button click handler
        BackButton.Click += BackButton_Click;
        
        // Subscribe to conversation navigation events
        if (DataContext is ChatViewModel viewModel)
        {
            viewModel.ConversationNavigationRequested += ChatViewModel_ConversationNavigationRequested;
        }
        
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
            viewModel.ConversationNavigationRequested -= ChatViewModel_ConversationNavigationRequested;
        }
        
        // Clean up message collection subscription to prevent memory leaks with null safety
        if (_currentSubscribedConversation?.Messages != null)
        {
            _currentSubscribedConversation.Messages.CollectionChanged -= Messages_CollectionChanged;
        }
        
        // Clear cached elements
        _cachedChatElements.Clear();
        
        // Set to null after all cleanup operations are complete
        _currentSubscribedConversation = null;
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