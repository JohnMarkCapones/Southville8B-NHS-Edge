using Avalonia;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Interactivity;
using Avalonia.Layout;
using Avalonia.Threading;
using Southville8BEdgeUI.ViewModels.Teacher;
using System;
using System.Collections.Generic;

namespace Southville8BEdgeUI.Views.Teacher;

public partial class MessagingView : UserControl
{
    private const double TabletBreakpoint = 1024;
    private const double MobileBreakpoint = 768;

    // Percentage-based width change threshold for responsive updates (5% of current width)
    private const double SignificantWidthChangePercentage = 0.05;

    // Responsive class name constants for consistency
    private const string MobileClass = "mobile";
    private const string TabletClass = "tablet";
    private const string DesktopClass = "desktop";


    // Consolidated collection for responsive elements by type (can be used for future optimization)
    private readonly Dictionary<string, List<Control>> _responsiveElements = new()
    {
        {"text", new List<Control>()},
        {"card", new List<Control>()},
        {"button", new List<Control>()},
        {"input", new List<Control>()}
    };

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
    private ConversationViewModel? _currentSubscribedConversation = null;

    // Simplified scroll handling
    private bool _isScrolling = false;

    // Visibility state tracking for efficient cache management
    private bool _lastConversationsCardVisible = false;
    private bool _lastChatCardVisible = false;

    // Recursion depth limit for UI traversal safety
    private const int MaxRecursionDepth = 10;

    public MessagingView()
    {
        InitializeComponent();
        if (Design.IsDesignMode)
        {
            DataContext = new MessagingViewModel();
        }

        // Store references to elements that need responsive behavior
        InitializeResponsiveElements();

        // Set up size change handler
        this.SizeChanged += OnSizeChanged;

        // Set up message text box event handlers
        SetupMessageTextBoxEvents();

        // Subscribe to conversation selection changes for mobile navigation
        if (DataContext is MessagingViewModel viewModel)
        {
            viewModel.PropertyChanged += ViewModel_PropertyChanged;
        }
    }

    // Set up enhanced message text box event handling
    private void SetupMessageTextBoxEvents()
    {
        if (MessageTextBox != null)
        {
            // Override key down events to ensure Enter key is properly handled
            MessageTextBox.KeyDown += MessageTextBox_KeyDown;
            MessageTextBox.LostFocus += MessageTextBox_LostFocus;
            MessageTextBox.GotFocus += MessageTextBox_GotFocus;
        }
    }

    // Handle key down events directly to bypass any scrollbar interference
    private void MessageTextBox_KeyDown(object? sender, KeyEventArgs e)
    {
        if (e.Key == Key.Enter && DataContext is MessagingViewModel viewModel)
        {
            // Prevent default behavior and send message immediately
            e.Handled = true;

            // Send message immediately without delay
            if (!string.IsNullOrWhiteSpace(viewModel.NewMessageText))
            {
                viewModel.SendMessageCommand.Execute(null);
                // Remove focus maintenance
            }
        }
    }

    // Handle focus events to maintain proper input state
    private void MessageTextBox_GotFocus(object? sender, GotFocusEventArgs e)
    {
        // Only position cursor at end of text, no focus management
        if (MessageTextBox != null)
        {
            MessageTextBox.CaretIndex = MessageTextBox.Text?.Length ?? 0;
        }
    }

    // Fixed method signature for LostFocus event
    private void MessageTextBox_LostFocus(object? sender, RoutedEventArgs e)
    {
        // Remove focus restoration code completely
    }

    // Simplified and immediate scroll method
    private void ScrollToBottomOfMessages()
    {
        if (MessagesScrollViewer != null && !_isScrolling)
        {
            _isScrolling = true;

            try
            {
                // Immediate scroll without dispatcher delays
                MessagesScrollViewer.ScrollToEnd();
            }
            finally
            {
                // Reset flag after a minimal delay
                Dispatcher.UIThread.Post(() => _isScrolling = false, DispatcherPriority.Normal);
            }
        }
    }

    // Update the ViewModel_PropertyChanged method to handle message subscriptions and mobile navigation
    private void ViewModel_PropertyChanged(object? sender, System.ComponentModel.PropertyChangedEventArgs e)
    {
        // Handle message collection subscription changes properly to prevent memory leaks
        if (e.PropertyName == nameof(MessagingViewModel.SelectedConversation) && DataContext is MessagingViewModel vm)
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

                // Immediate scroll to bottom when conversation changes
                ScrollToBottomOfMessages();

                // Handle mobile navigation when conversation is selected
                if ((_lastSizeClass == MobileClass || _lastSizeClass == TabletClass) && vm.SelectedConversation != null)
                {
                    NavigateToChat();
                }
            }
            else
            {
                _currentSubscribedConversation = null;
            }
        }
    }

    // Simplified message collection change handler with immediate scroll
    private void Messages_CollectionChanged(object? sender, System.Collections.Specialized.NotifyCollectionChangedEventArgs e)
    {
        if (e.Action == System.Collections.Specialized.NotifyCollectionChangedAction.Add)
        {
            // Only scroll, don't manage focus
            Dispatcher.UIThread.Post(() =>
            {
                ScrollToBottomOfMessages();
                // Remove focus management call
            }, DispatcherPriority.Render);
        }
    }

    // Send button click handler to ensure proper message sending
    private void SendButton_Click(object? sender, Avalonia.Interactivity.RoutedEventArgs e)
    {
        if (DataContext is MessagingViewModel viewModel && !string.IsNullOrWhiteSpace(viewModel.NewMessageText))
        {
            // Remove focus flag
            viewModel.SendMessageCommand.Execute(null);
            // Remove focus management call
        }
    }

    private void InitializeResponsiveElements()
    {
        // Add all named text elements that need responsive font sizes
        _responsiveElements["text"].AddRange(new Control[]
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
        _responsiveElements["card"].AddRange(new Control[]
        {
            ConversationsCard,
            ChatCard
        });

        // Add button elements
        _responsiveElements["button"].AddRange(new Control[]
        {
            NewChatButton,
            BackButton,
            CallButton,
            VideoButton,
            InfoButton,
            SendButton
        });

        // Add input elements
        _responsiveElements["input"].AddRange(new Control[]
        {
            SearchTextBox,
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
            FindAndCacheElementsIteratively(ConversationsCard);
        }

        if (ChatCard != null)
        {
            FindAndCacheElementsIteratively(ChatCard);
        }
    }

    // Iterative method using a stack to traverse all controls without depth limiting
    private void FindAndCacheElementsIteratively(Control root)
    {
        var stack = new Stack<Control>();
        stack.Push(root);

        while (stack.Count > 0)
        {
            var control = stack.Pop();

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

            // Traverse children
            if (control is Panel panel)
            {
                foreach (Control child in panel.Children)
                {
                    stack.Push(child);
                }
            }
            else if (control is ContentControl contentControl && contentControl.Content is Control contentChild)
            {
                stack.Push(contentChild);
            }
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

        // Calculate percentage-based threshold for more proportional responsiveness
        double widthChangeThreshold = Math.Max(width * SignificantWidthChangePercentage, 10); // Minimum 10px threshold
        bool significantWidthChange = Math.Abs(width - _lastWidth) > widthChangeThreshold;

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
            // Update all responsive elements using dictionary
            UpdateMainContainerClasses(sizeClass);
            UpdateElementClasses(_responsiveElements["text"], sizeClass);
            UpdateElementClasses(_responsiveElements["card"], sizeClass);
            UpdateElementClasses(_responsiveElements["button"], sizeClass);
            UpdateElementClasses(_responsiveElements["input"], sizeClass);

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

    // Layout configuration definitions extracted to a static class for maintainability
    private static class LayoutConfigurations
    {
        public static readonly LayoutConfiguration Mobile = new LayoutConfiguration
        {
            MainGridColumns = 1,
            ConversationsCardMargin = new Thickness(12),
            ChatCardMargin = new Thickness(12),
            ConversationsHeaderPadding = new Thickness(16),
            ChatHeaderPadding = new Thickness(16),
            ChatHeaderButtonsOrientation = Orientation.Horizontal,
            MessageInputOrientation = Orientation.Vertical,
            MessageInputSpacing = 8,
            SearchFilterOrientation = Orientation.Vertical,
            SearchFilterSpacing = 8,
            // ConversationsCardVisible, ChatCardVisible, ShowBackButton are set at runtime
        };

        public static readonly LayoutConfiguration Tablet = new LayoutConfiguration
        {
            MainGridColumns = 1,
            ConversationsCardMargin = new Thickness(16),
            ChatCardMargin = new Thickness(16),
            ConversationsHeaderPadding = new Thickness(20, 20, 20, 16),
            ChatHeaderPadding = new Thickness(20),
            ChatHeaderButtonsOrientation = Orientation.Horizontal,
            MessageInputOrientation = Orientation.Horizontal,
            MessageInputSpacing = 12,
            SearchFilterOrientation = Orientation.Vertical,
            SearchFilterSpacing = 12,
            // ConversationsCardVisible, ChatCardVisible, ShowBackButton are set at runtime
        };

        public static readonly LayoutConfiguration Desktop = new LayoutConfiguration
        {
            MainGridColumns = 2,
            ConversationsCardMargin = new Thickness(24, 24, 12, 24),
            ChatCardMargin = new Thickness(12, 24, 24, 24),
            ConversationsHeaderPadding = new Thickness(20, 20, 20, 16),
            ChatHeaderPadding = new Thickness(20),
            ChatHeaderButtonsOrientation = Orientation.Horizontal,
            MessageInputOrientation = Orientation.Horizontal,
            MessageInputSpacing = 12,
            SearchFilterOrientation = Orientation.Vertical,
            SearchFilterSpacing = 12,
            // ConversationsCardVisible, ChatCardVisible, ShowBackButton are set at runtime
        };
    }

    private LayoutConfiguration CreateLayoutConfig(string sizeClass)
    {
        LayoutConfiguration config;
        switch (sizeClass)
        {
            case MobileClass:
                config = CloneLayoutConfig(LayoutConfigurations.Mobile);
                config.ConversationsCardVisible = !_isMobileViewInChatMode;
                config.ChatCardVisible = _isMobileViewInChatMode;
                config.ShowBackButton = true;
                break;
            case TabletClass:
                config = CloneLayoutConfig(LayoutConfigurations.Tablet);
                config.ConversationsCardVisible = !_isMobileViewInChatMode;
                config.ChatCardVisible = _isMobileViewInChatMode;
                config.ShowBackButton = true;
                break;
            default:
                config = CloneLayoutConfig(LayoutConfigurations.Desktop);
                config.ConversationsCardVisible = true;
                config.ChatCardVisible = true;
                config.ShowBackButton = false;
                break;
        }
        return config;
    }

    // Helper method to clone a LayoutConfiguration instance
    private LayoutConfiguration CloneLayoutConfig(LayoutConfiguration source)
    {
        // Use the copy constructor for deep cloning
        return new LayoutConfiguration(source);
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
        NavigateToConversations();
    }

    protected override void OnAttachedToVisualTree(VisualTreeAttachmentEventArgs e)
    {
        base.OnAttachedToVisualTree(e);

        // Set up ALL button click handlers
        BackButton.Click += BackButton_Click;
        SendButton.Click += SendButton_Click;

        // Add the missing button event handlers
        NewChatButton.Click += NewChatButton_Click;
        CallButton.Click += CallButton_Click;
        VideoButton.Click += VideoButton_Click;
        InfoButton.Click += InfoButton_Click;

        // Initial responsive setup
        if (Bounds.Width > 0)
        {
            UpdateResponsiveClasses(Bounds.Width);
        }

        // Remove initial focus call
    }

    // Add the missing button click handlers
    private void NewChatButton_Click(object? sender, Avalonia.Interactivity.RoutedEventArgs e)
    {
        if (DataContext is MessagingViewModel viewModel)
        {
            viewModel.NewMessageCommand.Execute(null);
        }
    }

    private void CallButton_Click(object? sender, Avalonia.Interactivity.RoutedEventArgs e)
    {
        if (DataContext is MessagingViewModel viewModel)
        {
            viewModel.StartCallCommand.Execute(null);
        }
    }

    private void VideoButton_Click(object? sender, Avalonia.Interactivity.RoutedEventArgs e)
    {
        if (DataContext is MessagingViewModel viewModel)
        {
            viewModel.StartVideoCallCommand.Execute(null);
        }
    }

    private void InfoButton_Click(object? sender, Avalonia.Interactivity.RoutedEventArgs e)
    {
        if (DataContext is MessagingViewModel viewModel)
        {
            viewModel.ShowContactInfoCommand.Execute(null);
        }
    }

    protected override void OnDetachedFromVisualTree(VisualTreeAttachmentEventArgs e)
    {
        base.OnDetachedFromVisualTree(e);

        // Clean up ALL event handlers
        BackButton.Click -= BackButton_Click;
        SendButton.Click -= SendButton_Click;
        NewChatButton.Click -= NewChatButton_Click;
        CallButton.Click -= CallButton_Click;
        VideoButton.Click -= VideoButton_Click;
        InfoButton.Click -= InfoButton_Click;

        // Clean up message text box events
        if (MessageTextBox != null)
        {
            MessageTextBox.KeyDown -= MessageTextBox_KeyDown;
            MessageTextBox.LostFocus -= MessageTextBox_LostFocus;
            MessageTextBox.GotFocus -= MessageTextBox_GotFocus;
        }

        if (DataContext is MessagingViewModel viewModel)
        {
            viewModel.PropertyChanged -= ViewModel_PropertyChanged;
        }

        // Clean up message collection subscription to prevent memory leaks
        if (_currentSubscribedConversation?.Messages != null)
        {
            _currentSubscribedConversation.Messages.CollectionChanged -= Messages_CollectionChanged;
        }

        // Set to null after all cleanup operations are complete
        _currentSubscribedConversation = null;

        // Clear cached elements
        _cachedChatElements.Clear();
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

        // Default constructor
        public LayoutConfiguration()
        {
        }

        // Copy constructor to support cloning operations
        public LayoutConfiguration(LayoutConfiguration source)
        {
            if (source == null)
                throw new ArgumentNullException(nameof(source));

            MainGridColumns = source.MainGridColumns;
            ConversationsCardVisible = source.ConversationsCardVisible;
            ChatCardVisible = source.ChatCardVisible;
            ConversationsCardMargin = source.ConversationsCardMargin;
            ChatCardMargin = source.ChatCardMargin;
            ConversationsHeaderPadding = source.ConversationsHeaderPadding;
            ChatHeaderPadding = source.ChatHeaderPadding;
            ChatHeaderButtonsOrientation = source.ChatHeaderButtonsOrientation;
            MessageInputOrientation = source.MessageInputOrientation;
            MessageInputSpacing = source.MessageInputSpacing;
            SearchFilterOrientation = source.SearchFilterOrientation;
            SearchFilterSpacing = source.SearchFilterSpacing;
            ShowBackButton = source.ShowBackButton;
        }
    }
}