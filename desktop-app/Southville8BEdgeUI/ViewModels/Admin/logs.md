ChatService][Cache] SET chat/conversations?page=1&limit=20 ttl=120s etag=-
[MessagingViewModel] LoadConversationsAsync: Received 2 conversations
[MessagingViewModel] Mapping conversation - DTO Id: 'a0084fca-5e68-4a66-96df-3ff1f89ff9e9'
[MessagingViewModel] MapConversationDtoToViewModel: DTO Id = 'a0084fca-5e68-4a66-96df-3ff1f89ff9e9'
[MessagingViewModel] MapConversationDtoToViewModel: Created ViewModel with ConversationId = 'a0084fca-5e68-4a66-96df-3ff1f89ff9e9'
[MessagingViewModel] Mapped conversation - ConversationId: 'a0084fca-5e68-4a66-96df-3ff1f89ff9e9', ContactName: 'Richard Ramos Jr'
[MessagingViewModel] Mapping conversation - DTO Id: '53497aa7-22a7-49ad-95c0-7374031d9615'
[MessagingViewModel] MapConversationDtoToViewModel: DTO Id = '53497aa7-22a7-49ad-95c0-7374031d9615'
[MessagingViewModel] MapConversationDtoToViewModel: Created ViewModel with ConversationId = '53497aa7-22a7-49ad-95c0-7374031d9615'
[MessagingViewModel] Mapped conversation - ConversationId: '53497aa7-22a7-49ad-95c0-7374031d9615', ContactName: 'Robert Lee Johnson'
[MessagingViewModel] LoadConversationsAsync: Successfully loaded 2 conversations
[MessagingViewModel] SelectConversation called for: Richard Ramos Jr
[MessagingViewModel] ConversationId: 'a0084fca-5e68-4a66-96df-3ff1f89ff9e9'
[MessagingViewModel] Has 0 messages already loaded
[MessagingViewModel] Setting SelectedConversation to: Richard Ramos Jr
[MessagingViewModel] OnSelectedConversationChanged called - Value: Richard Ramos Jr
[MessagingView] HasSelectedConversation changed to: True
[MessagingViewModel] HasSelectedConversation property change notified - Value: True
[MessagingView] SelectedConversation changed - Messages count: 0
[MessagingView] HasSelectedConversation changed to: True
[MessagingView] SelectedConversation changed - Messages count: 0
[MessagingViewModel] HasSelectedConversation after setting: True
[MessagingViewModel] Loading messages for conversation: a0084fca-5e68-4a66-96df-3ff1f89ff9e9
[MessagingViewModel] LoadMessagesAsync: Fetching messages for conversation: a0084fca-5e68-4a66-96df-3ff1f89ff9e9
[ChatService][HTTP] GET chat/conversations/a0084fca-5e68-4a66-96df-3ff1f89ff9e9/messages?page=1&limit=50 (If-None-Match=-)
[MessagingView] Setting ChatGrid visibility to: True
[MessagingView] Setting EmptyStatePanel visibility to: False
[MessagingView] Setting ChatGrid visibility to: True
[MessagingView] Setting EmptyStatePanel visibility to: False
[ChatService][HTTP] OK (ETag=-)
[ChatService][Cache] SET chat/conversations/a0084fca-5e68-4a66-96df-3ff1f89ff9e9/messages?page=1&limit=50 ttl=60s etag=-
[MessagingViewModel] LoadMessagesAsync: Received 14 messages
[MessagingViewModel] First sender_id: aa0c0e87-b329-47d8-a925-76bf3f76760a, Last sender_id: b4c3204d-1f85-4256-9b9d-cdbc9f768527, CurrentUser: b4c3204d-1f85-4256-9b9d-cdbc9f768527
[MessagingViewModel] MapMessageDtoToViewModel: messageId=c4230747-f2aa-4670-acdc-cf04f365742e, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=aa0c0e87-b329-47d8-a925-76bf3f76760a, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=False
[MessagingViewModel] MapMessageDtoToViewModel: messageId=0e44df6a-c2a7-422b-a468-7e1bcb0d9c66, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=3d23bc00-681e-4b90-b4c9-60b1930a6cb1, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=aa0c0e87-b329-47d8-a925-76bf3f76760a, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=False
[MessagingViewModel] MapMessageDtoToViewModel: messageId=439f162f-f641-40fc-bd33-50a6a0c03a26, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=aa0c0e87-b329-47d8-a925-76bf3f76760a, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=False
[MessagingViewModel] MapMessageDtoToViewModel: messageId=730baa34-0bc8-409d-aa1f-dfa20dd7b957, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=1f4351cf-464b-4f09-ad7a-4e0995d6b9f1, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=60ae2c84-efac-4442-954b-9057ab00f4b4, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=aa0c0e87-b329-47d8-a925-76bf3f76760a, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=False
[MessagingViewModel] MapMessageDtoToViewModel: messageId=7dc73b8a-32a8-4ebd-98ef-2bc7fe9ed8e4, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=aa0c0e87-b329-47d8-a925-76bf3f76760a, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=False
[MessagingViewModel] MapMessageDtoToViewModel: messageId=3e801e79-a337-4391-8bb7-92d5dab310af, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=db723e78-a142-486b-ac6c-8e118ca8d690, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=d9661425-7186-44cd-8aea-378f28b9533a, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=f32a3cfb-d10f-4b9a-a2fc-5a4210111088, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=9e481ae9-ff35-4907-b81a-cce96d719e40, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=50e8be28-acda-417d-ac49-00c2a4d0acc2, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] LoadMessagesAsync: Successfully loaded 14 messages
[MessagingView] SelectedConversation changed - Messages count: 14
[MessagingViewModel] LoadMessagesAsync: Notified UI about SelectedConversation update
[MessagingView] HasSelectedConversation changed to: True
[MessagingView] SelectedConversation changed - Messages count: 14
[MessagingViewModel] SelectConversation completed successfully - HasSelectedConversation: True
[MessagingView] Setting ChatGrid visibility to: True
[MessagingView] Setting EmptyStatePanel visibility to: False
[Messaging] send teacher -> conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9 len=9
[ChatService][Cache] INVALIDATE chat/conversations/a0084fca-5e68-4a66-96df-3ff1f89ff9e9/messages?page=1&limit=50
[ChatService][Cache] INVALIDATE chat/conversations?page=1&limit=20
[Messaging] sent teacher ok id=e4252090-6bbc-404c-891a-ce3d27947665 at=2025-11-05T17:56:30.8690830+08:00
[MessagingViewModel] LoadMessagesAsync: Fetching messages for conversation: a0084fca-5e68-4a66-96df-3ff1f89ff9e9
[ChatService][HTTP] GET chat/conversations/a0084fca-5e68-4a66-96df-3ff1f89ff9e9/messages?page=1&limit=50 (If-None-Match=-)
[ChatService][HTTP] OK (ETag=-)
[ChatService][Cache] SET chat/conversations/a0084fca-5e68-4a66-96df-3ff1f89ff9e9/messages?page=1&limit=50 ttl=60s etag=-
[MessagingViewModel] LoadMessagesAsync: Received 15 messages
[MessagingViewModel] First sender_id: aa0c0e87-b329-47d8-a925-76bf3f76760a, Last sender_id: b4c3204d-1f85-4256-9b9d-cdbc9f768527, CurrentUser: b4c3204d-1f85-4256-9b9d-cdbc9f768527
[MessagingViewModel] MapMessageDtoToViewModel: messageId=c4230747-f2aa-4670-acdc-cf04f365742e, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=aa0c0e87-b329-47d8-a925-76bf3f76760a, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=False
[MessagingViewModel] MapMessageDtoToViewModel: messageId=0e44df6a-c2a7-422b-a468-7e1bcb0d9c66, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=3d23bc00-681e-4b90-b4c9-60b1930a6cb1, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=aa0c0e87-b329-47d8-a925-76bf3f76760a, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=False
[MessagingViewModel] MapMessageDtoToViewModel: messageId=439f162f-f641-40fc-bd33-50a6a0c03a26, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=aa0c0e87-b329-47d8-a925-76bf3f76760a, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=False
[MessagingViewModel] MapMessageDtoToViewModel: messageId=730baa34-0bc8-409d-aa1f-dfa20dd7b957, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=1f4351cf-464b-4f09-ad7a-4e0995d6b9f1, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=60ae2c84-efac-4442-954b-9057ab00f4b4, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=aa0c0e87-b329-47d8-a925-76bf3f76760a, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=False
[MessagingViewModel] MapMessageDtoToViewModel: messageId=7dc73b8a-32a8-4ebd-98ef-2bc7fe9ed8e4, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=aa0c0e87-b329-47d8-a925-76bf3f76760a, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=False
[MessagingViewModel] MapMessageDtoToViewModel: messageId=3e801e79-a337-4391-8bb7-92d5dab310af, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=db723e78-a142-486b-ac6c-8e118ca8d690, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=d9661425-7186-44cd-8aea-378f28b9533a, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=f32a3cfb-d10f-4b9a-a2fc-5a4210111088, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=9e481ae9-ff35-4907-b81a-cce96d719e40, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=50e8be28-acda-417d-ac49-00c2a4d0acc2, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=e4252090-6bbc-404c-891a-ce3d27947665, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] LoadMessagesAsync: Successfully loaded 15 messages
[MessagingView] SelectedConversation changed - Messages count: 15
[MessagingViewModel] LoadMessagesAsync: Notified UI about SelectedConversation update
The thread '.NET TP Worker' (21936) has exited with code 0 (0x0).
[MessagingViewModel] SelectConversation called for: Richard Ramos Jr
[MessagingViewModel] ConversationId: 'a0084fca-5e68-4a66-96df-3ff1f89ff9e9'
[MessagingViewModel] Has 15 messages already loaded
[MessagingViewModel] Setting SelectedConversation to: Richard Ramos Jr
[MessagingView] HasSelectedConversation changed to: True
[MessagingView] SelectedConversation changed - Messages count: 15
[MessagingViewModel] HasSelectedConversation after setting: True
[MessagingViewModel] Messages already loaded (15 messages)
[MessagingView] HasSelectedConversation changed to: True
[MessagingView] SelectedConversation changed - Messages count: 15
[MessagingViewModel] SelectConversation completed successfully - HasSelectedConversation: True
[MessagingView] Setting ChatGrid visibility to: True
[MessagingView] Setting EmptyStatePanel visibility to: False
[MessagingView] Setting ChatGrid visibility to: True
[MessagingView] Setting EmptyStatePanel visibility to: False
[Binding]Error in binding to 'Avalonia.Controls.Button'.'Command': 'Null value in expression '{empty}' at '$parent[UserControl, 0].DataContext'.'(Button #10927707)
[Binding]Error in binding to 'Avalonia.Controls.Button'.'Command': 'Null value in expression '{empty}' at '$parent[UserControl, 0].DataContext'.'(Button #24787485)
[MessagingViewModel] ctor: currentUserId=b4c3204d-1f85-4256-9b9d-cdbc9f768527
[ChatService][Cache] INVALIDATE chat/conversations/a0084fca-5e68-4a66-96df-3ff1f89ff9e9/messages?page=1&limit=50
[MessagingViewModel] LoadConversationsAsync: Fetching conversations
[Binding]Error in binding to 'Avalonia.Controls.Button'.'Command': 'Null value in expression '{empty}' at '$parent[UserControl, 0].DataContext'.'(Button #19779356)
[Binding]Error in binding to 'Avalonia.Controls.Button'.'Command': 'Null value in expression '{empty}' at '$parent[UserControl, 0].DataContext'.'(Button #54376870)
[Binding]Error in binding to 'Avalonia.Controls.Button'.'Command': 'Null value in expression '{empty}' at '$parent[UserControl, 0].DataContext'.'(Button #62885605)
[Binding]Error in binding to 'Avalonia.Controls.Button'.'Command': 'Null value in expression '{empty}' at '$parent[UserControl, 0].DataContext'.'(Button #32870980)
[Binding]Error in binding to 'Avalonia.Controls.Button'.'Command': 'Null value in expression '{empty}' at '$parent[UserControl, 0].DataContext'.'(Button #52268877)
[Binding]Error in binding to 'Avalonia.Controls.Button'.'Command': 'Null value in expression '{empty}' at '$parent[UserControl, 0].DataContext'.'(Button #42179171)
[Binding]Error in binding to 'Avalonia.Controls.Button'.'Command': 'Null value in expression '{empty}' at '$parent[UserControl, 0].DataContext'.'(Button #54570713)
[Binding]Error in binding to 'Avalonia.Controls.Button'.'Command': 'Null value in expression '{empty}' at '$parent[UserControl, 0].DataContext'.'(Button #28536129)
[Binding]Error in binding to 'Avalonia.Controls.Button'.'Command': 'Null value in expression '{empty}' at '$parent[UserControl, 0].DataContext'.'(Button #57876494)
[Binding]Error in binding to 'Avalonia.Controls.Button'.'Command': 'Null value in expression '{empty}' at '$parent[UserControl, 0].DataContext'.'(Button #51986009)
[Binding]Error in binding to 'Avalonia.Controls.Button'.'Command': 'Null value in expression '{empty}' at '$parent[UserControl, 0].DataContext'.'(Button #61483264)
[Binding]Error in binding to 'Avalonia.Controls.Button'.'Command': 'Null value in expression '{empty}' at '$parent[UserControl, 0].DataContext'.'(Button #55906660)
[MessagingView] DataContext changed, attached to MessagingViewModel
[ChatService][HTTP] GET chat/conversations?page=1&limit=20 (If-None-Match=-)
[MessagingView] Size changed to: 744 x 672
[ChatService][HTTP] OK (ETag=-)
[ChatService][Cache] SET chat/conversations?page=1&limit=20 ttl=120s etag=-
[MessagingViewModel] LoadConversationsAsync: Received 2 conversations
[MessagingViewModel] Mapping conversation - DTO Id: 'a0084fca-5e68-4a66-96df-3ff1f89ff9e9'
[MessagingViewModel] MapConversationDtoToViewModel: DTO Id = 'a0084fca-5e68-4a66-96df-3ff1f89ff9e9'
[MessagingViewModel] MapConversationDtoToViewModel: Created ViewModel with ConversationId = 'a0084fca-5e68-4a66-96df-3ff1f89ff9e9'
[MessagingViewModel] Mapped conversation - ConversationId: 'a0084fca-5e68-4a66-96df-3ff1f89ff9e9', ContactName: 'Richard Ramos Jr'
[MessagingViewModel] Mapping conversation - DTO Id: '53497aa7-22a7-49ad-95c0-7374031d9615'
[MessagingViewModel] MapConversationDtoToViewModel: DTO Id = '53497aa7-22a7-49ad-95c0-7374031d9615'
[MessagingViewModel] MapConversationDtoToViewModel: Created ViewModel with ConversationId = '53497aa7-22a7-49ad-95c0-7374031d9615'
[MessagingViewModel] Mapped conversation - ConversationId: '53497aa7-22a7-49ad-95c0-7374031d9615', ContactName: 'Robert Lee Johnson'
[MessagingViewModel] LoadConversationsAsync: Successfully loaded 2 conversations
[MessagingViewModel] SelectConversation called for: Richard Ramos Jr
[MessagingViewModel] ConversationId: 'a0084fca-5e68-4a66-96df-3ff1f89ff9e9'
[MessagingViewModel] Has 0 messages already loaded
[MessagingViewModel] Setting SelectedConversation to: Richard Ramos Jr
[MessagingViewModel] OnSelectedConversationChanged called - Value: Richard Ramos Jr
[MessagingView] HasSelectedConversation changed to: True
[MessagingViewModel] HasSelectedConversation property change notified - Value: True
[MessagingView] SelectedConversation changed - Messages count: 0
[MessagingView] HasSelectedConversation changed to: True
[MessagingView] SelectedConversation changed - Messages count: 0
[MessagingViewModel] HasSelectedConversation after setting: True
[MessagingViewModel] Loading messages for conversation: a0084fca-5e68-4a66-96df-3ff1f89ff9e9
[MessagingViewModel] LoadMessagesAsync: Fetching messages for conversation: a0084fca-5e68-4a66-96df-3ff1f89ff9e9
[ChatService][HTTP] GET chat/conversations/a0084fca-5e68-4a66-96df-3ff1f89ff9e9/messages?page=1&limit=50 (If-None-Match=-)
[MessagingView] Setting ChatGrid visibility to: True
[MessagingView] Setting EmptyStatePanel visibility to: False
[MessagingView] Setting ChatGrid visibility to: True
[MessagingView] Setting EmptyStatePanel visibility to: False
[ChatService][HTTP] OK (ETag=-)
[ChatService][Cache] SET chat/conversations/a0084fca-5e68-4a66-96df-3ff1f89ff9e9/messages?page=1&limit=50 ttl=60s etag=-
[MessagingViewModel] LoadMessagesAsync: Received 15 messages
[MessagingViewModel] First sender_id: aa0c0e87-b329-47d8-a925-76bf3f76760a, Last sender_id: b4c3204d-1f85-4256-9b9d-cdbc9f768527, CurrentUser: b4c3204d-1f85-4256-9b9d-cdbc9f768527
[MessagingViewModel] MapMessageDtoToViewModel: messageId=c4230747-f2aa-4670-acdc-cf04f365742e, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=aa0c0e87-b329-47d8-a925-76bf3f76760a, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=False
[MessagingViewModel] MapMessageDtoToViewModel: messageId=0e44df6a-c2a7-422b-a468-7e1bcb0d9c66, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=3d23bc00-681e-4b90-b4c9-60b1930a6cb1, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=aa0c0e87-b329-47d8-a925-76bf3f76760a, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=False
[MessagingViewModel] MapMessageDtoToViewModel: messageId=439f162f-f641-40fc-bd33-50a6a0c03a26, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=aa0c0e87-b329-47d8-a925-76bf3f76760a, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=False
[MessagingViewModel] MapMessageDtoToViewModel: messageId=730baa34-0bc8-409d-aa1f-dfa20dd7b957, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=1f4351cf-464b-4f09-ad7a-4e0995d6b9f1, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=60ae2c84-efac-4442-954b-9057ab00f4b4, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=aa0c0e87-b329-47d8-a925-76bf3f76760a, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=False
[MessagingViewModel] MapMessageDtoToViewModel: messageId=7dc73b8a-32a8-4ebd-98ef-2bc7fe9ed8e4, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=aa0c0e87-b329-47d8-a925-76bf3f76760a, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=False
[MessagingViewModel] MapMessageDtoToViewModel: messageId=3e801e79-a337-4391-8bb7-92d5dab310af, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=db723e78-a142-486b-ac6c-8e118ca8d690, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=d9661425-7186-44cd-8aea-378f28b9533a, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=f32a3cfb-d10f-4b9a-a2fc-5a4210111088, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=9e481ae9-ff35-4907-b81a-cce96d719e40, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=50e8be28-acda-417d-ac49-00c2a4d0acc2, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] MapMessageDtoToViewModel: messageId=e4252090-6bbc-404c-891a-ce3d27947665, conv=a0084fca-5e68-4a66-96df-3ff1f89ff9e9, sender_id=b4c3204d-1f85-4256-9b9d-cdbc9f768527, currentUser=b4c3204d-1f85-4256-9b9d-cdbc9f768527, isSent=True
[MessagingViewModel] LoadMessagesAsync: Successfully loaded 15 messages
[MessagingView] SelectedConversation changed - Messages count: 15
[MessagingViewModel] LoadMessagesAsync: Notified UI about SelectedConversation update
[MessagingViewModel] Marking conversation as read: a0084fca-5e68-4a66-96df-3ff1f89ff9e9
[MessagingView] HasSelectedConversation changed to: True
[MessagingView] SelectedConversation changed - Messages count: 15
[MessagingViewModel] SelectConversation completed successfully - HasSelectedConversation: True
[MessagingView] Setting ChatGrid visibility to: True
[MessagingView] Setting EmptyStatePanel visibility to: False
[ChatService][Cache] INVALIDATE chat/conversations/a0084fca-5e68-4a66-96df-3ff1f89ff9e9/messages?page=1&limit=50
[ChatService][Cache] INVALIDATE chat/conversations?page=1&limit=20
=== TEACHER LOGOUT STARTED ===
MainNavigateTo is null: False
Clearing cached ViewModels...
Cached ViewModels cleared
Resetting CurrentContent...
[Binding]Error in binding to 'Avalonia.Controls.Button'.'Command': 'Null value in expression '{empty}' at '$parent[UserControl, 0].DataContext'.'(Button #44698648)
[Binding]Error in binding to 'Avalonia.Controls.Button'.'Command': 'Null value in expression '{empty}' at '$parent[UserControl, 0].DataContext'.'(Button #42272227)
CurrentContent reset
Calling AuthService.LogoutAsync...
AuthService.LogoutAsync completed
Theme reset to Light mode
=== TOAST SHOW CALLED ===
Manager is null: False
Title: 'Goodbye!', Message: 'You have been logged out successfully'
=== NOTIFICATION SENT TO MANAGER ===
Creating LoginViewModel...
LoginViewModel created: True
LoginViewModel.NavigateTo set to MainNavigateTo
Invoking MainNavigateTo...
=== MAIN WINDOW NAVIGATION ===
CurrentViewModel changed to: LoginViewModel
[Binding]Error in binding to 'Avalonia.Controls.ColumnDefinition'.'Width': 'Null value in expression '{empty}' at ''.'(ColumnDefinition #34718112)
[Binding]Error in binding to 'Avalonia.Controls.ColumnDefinition'.'Width': 'Null value in expression '{empty}' at ''.'(ColumnDefinition #48682277)
MainNavigateTo invoked successfully
=== TEACHER LOGOUT COMPLETED ===
=== LoginViewModel.Login ===
Email: superadmin@gmail.com
Password: [HIDDEN]
IsLoading set to: True
Starting login process...
=== AuthService.LoginAsync ===
Email: superadmin@gmail.com
Password: [HIDDEN]
Calling API endpoint: auth/login
=== API Request ===
Method: POST
Endpoint: auth/login
Full URL: http://localhost:3004/api/v1/auth/login
Data: {"email":"superadmin@gmail.com","password":"skadoosh"}
=== Token Check ===
Cached token present: True
Access token present: True
Token length: 762
Authorization header set: Bearer eyJhbGciOiJIUzI1NiIs...
Request Body: {"email":"superadmin@gmail.com","password":"skadoosh"}
Sending request to: auth/login
=== API Response ===
Status Code: OK
Response Content: {"success":true,"user":{"id":"aa0c0e87-b329-47d8-a925-76bf3f76760a","email":"superadmin@gmail.com","role":"Admin","created_at":"2025-10-13T14:51:22.352123Z","email_confirmed_at":"2025-10-13T14:51:22.399726Z","user_metadata":{"email_verified":true}},"session":{"access_token":"eyJhbGciOiJIUzI1NiIsImtpZCI6IkIxQ0pQd0JrL0o1S3pSeDkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2hhZnVoeG1xd2VhbG12dmpmZ2N3LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJhYTBjMGU4Ny1iMzI5LTQ3ZDgtYTkyNS03NmJmM2Y3Njc2MGEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYyMzQ2NjQ3LCJpYXQiOjE3NjIzMzY2NDcsImVtYWlsIjoic3VwZXJhZG1pbkBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlfSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc2MjMzNjY0N31dLCJzZXNzaW9uX2lkIjoiNmYzOWVlMjEtOTg3Ni00ZTQ0LWExNjUtYmZmMTg4MDhkY2U4IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.YQxmXhKnRpI5k8WADFYS9B5cqbxxfNyw-5rZE2wNgzI","refresh_token":"gxqfwottsjmk","expires_at":1762346647},"message":"Login successful"}
API Response: Received response
Success: True
User: Role: Admin
Session: Present
Message: Login successful
Login successful for user: superadmin@gmail.com with role: Admin
[LoginViewModel] Role from response: 'Admin'
[LoginViewModel] Role is null: False
[LoginViewModel] Role is empty: False
[RoleValidation] Checking role: 'Admin'
[RoleValidation] Allowed roles: [Admin, Teacher]
[RoleValidation] Is role allowed: True
[LoginViewModel] IsRoleAllowed returned: True
[LoginViewModel] Access granted for role: 'Admin'
=== TOAST SHOW CALLED ===
Manager is null: False
Title: 'Success', Message: 'Welcome back, superadmin@gmail.com!'
=== NOTIFICATION SENT TO MANAGER ===
=== CREATING ADMIN SHELL ===
Access token set directly: Bearer eyJhbGciOiJIUzI1NiIs...
Access token set directly: Bearer eyJhbGciOiJIUzI1NiIs...
=== Token Check ===
Cached token present: True
Access token present: True
Token length: 730
Authorization header set: Bearer eyJhbGciOiJIUzI1NiIs...
[ApiClient][HTTP] GET desktop-admin-dashboard/metrics (If-None-Match=-)
=== Token Check ===
Cached token present: True
Access token present: True
Token length: 730
Authorization header set: Bearer eyJhbGciOiJIUzI1NiIs...
[ApiClient][HTTP] GET events?page=1&limit=50&status=published&startDate=2025-11-05&endDate=2025-11-12 (If-None-Match=-)
[ApiClient][HTTP] GET academic-years/active (If-None-Match=-)
AdminShellViewModel created: True
LoginViewModel.NavigateTo is null: False
About to invoke NavigateTo with AdminShellViewModel
=== MAIN WINDOW NAVIGATION ===
CurrentViewModel changed to: AdminShellViewModel
[Binding]Error in binding to 'Avalonia.Controls.ColumnDefinition'.'Width': 'Null value in expression '{empty}' at ''.'(ColumnDefinition #58019867)
[Binding]Error in binding to 'Avalonia.Controls.ColumnDefinition'.'Width': 'Null value in expression '{empty}' at ''.'(ColumnDefinition #16060772)
Navigation to AdminShell completed
IsLoading set to: False
Access token stored successfully
[ApiClient][HTTP] OK (ETag=-)
=== Token Check ===
Cached token present: True
Access token present: True
Token length: 730
Authorization header set: Bearer eyJhbGciOiJIUzI1NiIs...
[ApiClient][HTTP] GET events?page=1&limit=100&status=upcoming (If-None-Match=-)
User profile loaded: Richard Ramos Jr (Administrator)
[ApiClient][HTTP] OK (ETag=-)
[ApiClient][Cache] SET events?page=1&limit=50&status=published&startDate=2025-11-05&endDate=2025-11-12 ttl=120s etag=-
[ApiClient][HTTP] OK (ETag=-)
[GetActiveAcademicYearAsync] Raw API Response:
Status Code: 200
Response Content: {"id":"6f47753f-2c0f-4978-804c-e76f18abcf0b","year_name":"2025-2026","start_date":"2025-10-27","end_date":"2026-10-26","structure":"quarters","is_active":true,"is_archived":false,"description":"CHECK 2","created_at":"2025-10-26T07:51:27.164363+00:00","updated_at":"2025-10-26T07:51:33.484193+00:00","created_by":null,"updated_by":null}
AcademicYear DTO received:
  Id: 6f47753f-2c0f-4978-804c-e76f18abcf0b
  YearName: 2025-2026
  StartDate: 2025-10-27
  EndDate: 2026-10-26
  IsActive: True
Active academic year loaded: 2025-2026
[ApiClient][HTTP] OK (ETag=-)
[ApiClient][Cache] SET events?page=1&limit=100&status=upcoming ttl=120s etag=-
=== Token Check ===
Cached token present: True
Access token present: True
Token length: 730
Authorization header set: Bearer eyJhbGciOiJIUzI1NiIs...
[ApiClient][HTTP] GET schedules?page=1&limit=100 (If-None-Match=-)
[Binding]Error in binding to 'Avalonia.Controls.Button'.'Command': 'Null value in expression '{empty}' at '$parent[UserControl, 0].DataContext'.'(Button #7049250)
[Binding]Error in binding to 'Avalonia.Controls.Button'.'Command': 'Null value in expression '{empty}' at '$parent[UserControl, 0].DataContext'.'(Button #25510342)
[Binding]Error in binding to 'Avalonia.Controls.Button'.'Command': 'Null value in expression '{empty}' at '$parent[UserControl, 0].DataContext'.'(Button #30210345)
[Binding]Error in binding to 'Avalonia.Controls.Button'.'Command': 'Null value in expression '{empty}' at '$parent[UserControl, 0].DataContext'.'(Button #12555853)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #53016353)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #18123955)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #34284824)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #43049533)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #22773026)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #27613884)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #23436172)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #36234788)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #1290197)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #16772571)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #16716843)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #15992377)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #6574316)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #18357250)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #37317670)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #15367662)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #65561878)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #46998048)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #6994859)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #23824305)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #41280514)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #66884645)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #64194027)
[Binding]Error in binding to 'Avalonia.Animation.AnimatorKeyFrame'.'Value': 'Null value in expression '{empty}' at '$parent[ProgressBar, 0]'.'(AnimatorKeyFrame #29215987)
[ChatService][HTTP] GET chat/conversations?page=1&limit=20 (If-None-Match=-)
[ApiClient][HTTP] OK (ETag=-)
[ApiClient][Cache] SET schedules?page=1&limit=100 ttl=60s etag=-
=== Token Check ===
Cached token present: True
Access token present: True
Token length: 730
Authorization header set: Bearer eyJhbGciOiJIUzI1NiIs...
[ApiClient][HTTP] GET buildings?limit=100 (If-None-Match=-)
[ApiClient][HTTP] OK (ETag=-)
[ApiClient][Cache] SET buildings?limit=100 ttl=600s etag=-
=== Token Check ===
Cached token present: True
Access token present: True
Token length: 730
Authorization header set: Bearer eyJhbGciOiJIUzI1NiIs...
[ApiClient][HTTP] GET rooms?limit=100 (If-None-Match=-)
[ApiClient][HTTP] OK (ETag=-)
[ApiClient][Cache] SET rooms?limit=100 ttl=600s etag=-
=== Token Check ===
Cached token present: True
Access token present: True
Token length: 730
Authorization header set: Bearer eyJhbGciOiJIUzI1NiIs...
[ApiClient][HTTP] GET departments?page=1&limit=100 (If-None-Match=-)
[ApiClient][HTTP] OK (ETag=-)
[ApiClient][Cache] SET departments?page=1&limit=100 ttl=600s etag=-
=== LOADING GRADE DISTRIBUTION ===
=== Token Check ===
Cached token present: True
Access token present: True
Token length: 730
Authorization header set: Bearer eyJhbGciOiJIUzI1NiIs...
[ApiClient][HTTP] GET desktop-sidebar/student-distribution (If-None-Match=-)
[ChatService][HTTP] OK (ETag=-)
[ChatService][Cache] SET chat/conversations?page=1&limit=20 ttl=120s etag=-
[ApiClient][HTTP] OK (ETag=-)
[ApiClient][Cache] SET desktop-sidebar/student-distribution ttl=120s etag=-
Authoritative stats found. Total=75
=== LOADING ROOM STATUS ===
=== Token Check ===
Cached token present: True
Access token present: True
Token length: 730
Authorization header set: Bearer eyJhbGciOiJIUzI1NiIs...
[ApiClient][Cache] HIT rooms?limit=100
Total rooms fetched: 34
Room counts - Available: 31, Occupied: 2, Maintenance: 1
Total rooms: 34, Utilization: 5.9%
=== ROOM STATUS LOADED ===
=== LOADING UPCOMING EVENTS ===
=== Token Check ===
Cached token present: True
Access token present: True
Token length: 730
Authorization header set: Bearer eyJhbGciOiJIUzI1NiIs...
[ApiClient][HTTP] GET events?page=1&limit=20&status=published (If-None-Match=-)
[ApiClient][HTTP] OK (ETag=-)
[ApiClient][Cache] SET events?page=1&limit=20&status=published ttl=120s etag=-
Fetched 19 published events
Filtered to 1 upcoming events
=== LOADED 1 UPCOMING EVENTS ===
Added event: EVENT TITLE V1 - Nov 9, 10:00 PM
[ChatService][HTTP] GET chat/conversations/a0084fca-5e68-4a66-96df-3ff1f89ff9e9/messages?page=1&limit=50 (If-None-Match=-)
[ChatService][HTTP] OK (ETag=-)
[ChatService][Cache] SET chat/conversations/a0084fca-5e68-4a66-96df-3ff1f89ff9e9/messages?page=1&limit=50 ttl=60s etag=-
[ChatService][Cache] INVALIDATE chat/conversations/a0084fca-5e68-4a66-96df-3ff1f89ff9e9/messages?page=1&limit=50
[ChatService][Cache] INVALIDATE chat/conversations?page=1&limit=20
The thread '.NET TP Worker' (2000) has exited with code 0 (0x0).
The thread '.NET TP Worker' (24800) has exited with code 0 (0x0).
The thread '.NET TP Worker' (11964) has exited with code 0 (0x0).
The thread '.NET TP Worker' (21692) has exited with code 0 (0x0).
