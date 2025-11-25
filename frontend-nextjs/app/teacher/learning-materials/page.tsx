"use client"

import type React from "react"
import { useState, useCallback, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Upload,
  Download,
  Trash2,
  MoreVertical,
  FolderTree,
  Grid3X3,
  List,
  Loader2,
  AlertCircle,
  Folder,
  FolderPlus,
  FileText,
  File,
  FileSpreadsheet,
  FileImage,
  HardDrive,
  ChevronDown,
  ChevronRight,
  Home,
  X,
} from "lucide-react"
import { useLearningMaterials } from "@/hooks/useLearningMaterials"
import { FileUpload } from "@/components/learning-materials/FileUpload"
import { CreateFolderModal } from "@/components/learning-materials/CreateFolderModal"
import { useToast } from "@/hooks/use-toast"

/**
 * Teacher Learning Materials Page
 *
 * Real implementation using the learning materials API.
 * Provides folder navigation, file management, and upload functionality.
 */
export default function TeacherLearningMaterialsPage() {
  const { toast } = useToast();

  // Learning materials hook with real API integration
  const {
    folders,
    files,
    currentFolder,
    loading,
    error,
    currentFolderId,
    setCurrentFolderId,
    createFolder,
    uploadFile,
    downloadFile,
    deleteFile,
    searchQuery,
    setSearchQuery,
    mimeTypeFilter,
    setMimeTypeFilter,
    pagination,
    setPage,
    setLimit,
    refetch,
  } = useLearningMaterials({
    initialFileParams: {
      page: 1,
      limit: 20,
    },
  });

  // Local UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));

  // Toggle folder expansion
  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  // Get file icon based on MIME type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <FileImage className="w-5 h-5 text-blue-500" />;
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    if (mimeType.includes('document') || mimeType.includes('word')) return <FileText className="w-5 h-5 text-blue-600" />;
    return <File className="w-5 h-5 text-slate-500" />;
  };

  // Get folder statistics
  const getFolderStats = useCallback((folderId: string) => {
    const folderFiles = files.filter(f => f.folder_id === folderId);
    const fileCount = folderFiles.length;
    const totalSize = folderFiles.reduce((acc, f) => acc + (f.file_size_bytes || 0), 0);
    return { fileCount, totalSize };
  }, [files]);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle file download
  const handleDownload = async (file: any) => {
    try {
      await downloadFile(file.id);
      toast({
        title: "Download Started",
        description: `Downloading ${file.title}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle file upload
  const handleUpload = async (files: File[], metadata: { title: string; description?: string }) => {
    if (!currentFolderId) {
      toast({
        title: "No Folder Selected",
        description: "Please select a folder to upload files.",
        variant: "destructive",
      });
      return;
    }

    try {
      for (const file of files) {
        await uploadFile(currentFolderId, file, {
          title: metadata.title || file.name,
          description: metadata.description,
        });
      }

      toast({
        title: "Upload Successful",
        description: `Successfully uploaded ${files.length} file(s)`,
      });

      setShowUpload(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle file deletion
  const handleDelete = async (file: any) => {
    try {
      await deleteFile(file.id);
      toast({
        title: "File Deleted",
        description: `${file.title} has been deleted`,
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle folder creation
  const handleCreateFolder = async (data: { name: string; description?: string; parent_id?: string }) => {
    try {
      const newFolder = await createFolder(data);
      toast({
        title: "Folder Created",
        description: `${newFolder.name} has been created successfully`,
      });
      setShowCreateFolder(false);
      setCurrentFolderId(newFolder.id);
    } catch (error) {
      console.error('Create folder error:', error);
      throw error;
    }
  };

  // Handle bulk operations
  const handleBulkDownload = async () => {
    for (const fileId of selectedFiles) {
      try {
        await downloadFile(fileId);
      } catch (error) {
        console.error('Bulk download error:', error);
      }
    }
    setSelectedFiles([]);
  };

  const handleBulkDelete = async () => {
    for (const fileId of selectedFiles) {
      try {
        await deleteFile(fileId);
      } catch (error) {
        console.error('Bulk delete error:', error);
      }
    }
    setSelectedFiles([]);
  };

  // Get child folders for current folder (for main content area)
  const currentFolderChildren = useMemo(() => {
    return folders.filter(f => f.parent_id === currentFolderId);
  }, [folders, currentFolderId]);

  // Debug: Log folder structure
  useEffect(() => {
    if (folders.length > 0) {
      console.log('📁 [Folder Tree Debug] Total folders loaded:', folders.length);
      console.log('📁 [Folder Tree Debug] Folder structure:', folders.map(f => ({
        id: f.id,
        name: f.name,
        parent_id: f.parent_id,
        hasParent: !!f.parent_id
      })));

      const rootFolders = folders.filter(f => !f.parent_id);
      console.log('📁 [Folder Tree Debug] Root folders:', rootFolders.length);

      folders.forEach(folder => {
        const children = folders.filter(f => f.parent_id === folder.id);
        if (children.length > 0) {
          console.log(`📁 [Folder Tree Debug] "${folder.name}" has ${children.length} children:`, children.map(c => c.name));
        }
      });
    }
  }, [folders]);

  // Folder tree item component (recursive)
  const FolderTreeItem = ({ folder, level = 0 }: { folder: any; level?: number }) => {
    const subfolders = folders.filter(f => f.parent_id === folder.id);
    const hasSubfolders = subfolders.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const isActive = currentFolderId === folder.id;
    const stats = getFolderStats(folder.id);

    // Debug log for this folder
    useEffect(() => {
      if (hasSubfolders) {
        console.log(`📁 [Tree Item] "${folder.name}" has ${subfolders.length} subfolders, expanded: ${isExpanded}`);
      }
    }, [folder.name, hasSubfolders, subfolders.length, isExpanded]);

    return (
      <div>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
            isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-accent hover:text-accent-foreground"
          }`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          onClick={() => setCurrentFolderId(folder.id)}
        >
          {hasSubfolders ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.id);
              }}
              className="p-0.5 hover:bg-accent/50 rounded flex-shrink-0"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-5 flex-shrink-0" />
          )}
          <Folder className="w-4 h-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <span className="flex-1 text-sm truncate">{folder.name}</span>
          {stats.fileCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {stats.fileCount}
            </Badge>
          )}
        </div>
        {hasSubfolders && isExpanded && (
          <div>
            {subfolders.map((subfolder) => (
              <FolderTreeItem key={subfolder.id} folder={subfolder} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Error state
  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-6">
        <Card className="border-red-200 bg-red-50 dark:bg-red-950 max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
              Failed to Load Learning Materials
            </h2>
            <p className="text-red-700 dark:text-red-300 mb-4">
              {error.message}
            </p>
            <Button onClick={refetch} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Left Sidebar - Folder Tree */}
      <div className="w-72 border-r border-border bg-white dark:bg-slate-900 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <FolderTree className="w-5 h-5" />
              Folders
            </h2>
            {/* <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowCreateFolder(true)}
            >
              <FolderPlus className="w-4 h-4" />
            </Button> */}
          </div>
        </div>

        {/* Folder Tree */}
        <div className="flex-1 overflow-y-auto p-2">
          {/* Root folder */}
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all mb-1 ${
              currentFolderId === null ? "bg-primary text-primary-foreground font-medium" : "hover:bg-accent hover:text-accent-foreground"
            }`}
            onClick={() => setCurrentFolderId(null)}
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-sm">All Files</span>
            <Badge variant="secondary" className="text-xs">
              {files.length}
            </Badge>
          </div>

          {/* Folder tree */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground px-3 py-2 uppercase tracking-wider">Folders</p>
            {folders.filter(f => !f.parent_id).map((folder) => (
              <FolderTreeItem key={folder.id} folder={folder} />
            ))}
          </div>
        </div>

        {/* Storage info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <HardDrive className="w-4 h-4" />
            <span>{files.length} files</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {currentFolder ? currentFolder.name : 'All Files'}
              </h1>
              {currentFolder?.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {currentFolder.description}
                </p>
              )}
            </div>

            {/* <Button onClick={() => setShowUpload(true)} disabled={!currentFolderId}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button> */}
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={mimeTypeFilter || "all"} onValueChange={(value) => setMimeTypeFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="application/pdf">PDF</SelectItem>
                <SelectItem value="application/msword">Word</SelectItem>
                <SelectItem value="application/vnd.ms-excel">Excel</SelectItem>
                <SelectItem value="image/">Images</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 border border-border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedFiles.length > 0 && (
          <div className="px-6 py-3 bg-primary/5 border-b border-primary/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary">
                {selectedFiles.length} file(s) selected
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleBulkDownload}>
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFiles([])}>
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Files Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Subfolders Section */}
              {currentFolderChildren.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                    Folders
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {currentFolderChildren.map((folder) => {
                      const stats = getFolderStats(folder.id);
                      return (
                        <div
                          key={folder.id}
                          className="group relative rounded-lg overflow-hidden border border-border hover:border-blue-500/50 transition-all duration-200 hover:shadow-lg cursor-pointer bg-white dark:bg-slate-900"
                          onClick={() => setCurrentFolderId(folder.id)}
                        >
                          <div className="p-4 bg-gradient-to-br from-blue-50/30 to-transparent dark:from-blue-950/20 dark:to-transparent">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm mb-1 truncate text-slate-900 dark:text-slate-100">
                                  {folder.name}
                                </h3>
                                {folder.description && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                    {folder.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                              <span>{stats.fileCount} {stats.fileCount === 1 ? 'file' : 'files'}</span>
                              {stats.totalSize > 0 && (
                                <span>{formatFileSize(stats.totalSize)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Files Section */}
              {files.length === 0 && currentFolderChildren.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No files found</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentFolderId ? 'Upload files to this folder to get started' : 'Select a folder to view files'}
                  </p>
                </div>
              ) : files.length > 0 && (
                <div>
                  {currentFolderChildren.length > 0 && (
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                      Files
                    </h3>
                  )}
                  {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="group relative rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-white dark:bg-slate-900"
                >
                  {/* Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selectedFiles.includes(file.id)}
                      onCheckedChange={() => {
                        setSelectedFiles(prev =>
                          prev.includes(file.id)
                            ? prev.filter(id => id !== file.id)
                            : [...prev, file.id]
                        );
                      }}
                      className="bg-white dark:bg-slate-900 border-2 shadow-sm"
                    />
                  </div>

                  {/* Actions */}
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="secondary" className="h-7 w-7 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-md">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload(file)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(file)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* File icon/preview */}
                  <div className="aspect-video bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-8">
                    {getFileIcon(file.mime_type)}
                  </div>

                  {/* File info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm truncate mb-1">{file.title}</h3>
                    {file.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {file.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(file.file_size_bytes)}</span>
                      <span>{new Date(file.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
                  ) : (
                    <div className="space-y-2">
                      {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all bg-white dark:bg-slate-900"
                >
                  <Checkbox
                    checked={selectedFiles.includes(file.id)}
                    onCheckedChange={() => {
                      setSelectedFiles(prev =>
                        prev.includes(file.id)
                          ? prev.filter(id => id !== file.id)
                          : [...prev, file.id]
                      );
                    }}
                  />
                  <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    {getFileIcon(file.mime_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{file.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{file.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>{formatFileSize(file.file_size_bytes)}</span>
                      <span>{new Date(file.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload(file)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(file)} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-border bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} files
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>

                <span className="text-sm px-2">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upload Files</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowUpload(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <FileUpload
                folderId={currentFolderId!}
                onUpload={handleUpload}
                uploading={loading}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onCreateFolder={handleCreateFolder}
        folders={folders}
        currentFolderId={currentFolderId}
        isCreating={loading}
      />
    </div>
  );
}
