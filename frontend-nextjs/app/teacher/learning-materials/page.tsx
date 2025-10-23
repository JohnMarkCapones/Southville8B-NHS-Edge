"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Upload,
  FolderTree,
  Grid3X3,
  List,
  BookOpen,
  Plus,
  Settings,
  Filter,
  SortAsc,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { useLearningMaterials } from "@/hooks/useLearningMaterials"
import { FolderTree as FolderTreeComponent } from "@/components/learning-materials/FolderTree"
import { FileGrid } from "@/components/learning-materials/FileGrid"
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
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
      // Navigate to the new folder
      setCurrentFolderId(newFolder.id);
    } catch (error) {
      console.error('Create folder error:', error);
      throw error; // Let the modal handle the error display
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

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50 dark:bg-red-950">
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Learning Materials
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage and organize your teaching resources
          </p>
        </div>

        <div className="flex items-center gap-2">
                  <Button
            onClick={() => setShowUpload(true)}
            disabled={!currentFolderId}
          >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Files
                    </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Folder Tree */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FolderTree className="h-5 w-5" />
                  Folders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <FolderTreeComponent
                folders={folders}
                currentFolderId={currentFolderId}
                onFolderSelect={setCurrentFolderId}
                showRoot={true}
                showNewFolderButton={true}
                onNewFolderClick={() => setShowCreateFolder(true)}
                className="p-4"
              />
            </CardContent>
          </Card>
            </div>

        {/* Main Content - Files */}
        <div className="lg:col-span-3 space-y-4">
          {/* Current Folder Info */}
          {currentFolder && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{currentFolder.name}</h2>
                    {currentFolder.description && (
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        {currentFolder.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {pagination?.total || 0} files
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
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

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                      </Button>
                    </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedFiles.length > 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary">
                    {selectedFiles.length} file(s) selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkDownload}
                    >
                      Download Selected
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                    >
                      Delete Selected
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFiles([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Files Grid */}
          <FileGrid
            files={files}
            loading={loading}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onDownload={handleDownload}
            onDelete={handleDelete}
            showSelection={true}
            selectedFiles={selectedFiles}
            onSelectionChange={setSelectedFiles}
          />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
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
                    
                    <span className="text-sm">
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
              </CardContent>
            </Card>
          )}
                  </div>
                </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
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