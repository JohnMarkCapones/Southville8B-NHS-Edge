import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { helpArticles, helpCategories, taskCategories, faqs, searchHelpContent, HelpArticle, FAQ } from '@/constants/help-content';
import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';

type TabType = 'browse' | 'tasks' | 'faq';

export default function HelpCenter() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const [activeTab, setActiveTab] = useState<TabType>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ articles: HelpArticle[]; faqs: FAQ[] }>({ articles: [], faqs: [] });
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Reset search state and clear results
      setSearchQuery('');
      setSearchResults({ articles: [], faqs: [] });
      setSelectedCategory(null);
      setExpandedArticleId(null);
      setExpandedFaqId(null);
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error refreshing help center:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        const results = searchHelpContent(searchQuery, helpArticles, faqs);
        setSearchResults(results);
        setIsSearching(false);
      }, 300);

      return () => {
        clearTimeout(timer);
        setIsSearching(false);
      };
    } else {
      setSearchResults({ articles: [], faqs: [] });
      setIsSearching(false);
    }
  }, [searchQuery]);

  const toggleArticle = (id: string) => {
    setExpandedArticleId(expandedArticleId === id ? null : id);
  };

  const toggleFaq = (id: string) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ articles: [], faqs: [] });
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const getCategoryArticles = (categoryId: string) => {
    const category = [...helpCategories, ...taskCategories].find(cat => cat.id === categoryId);
    if (!category) return [];
    return helpArticles.filter(article => category.articleIds.includes(article.id));
  };

  const renderSearchResults = () => {
    if (!searchQuery.trim()) return null;

  return (
      <View style={styles.searchResults}>
        <View style={styles.searchResultsHeader}>
          <Text style={styles.searchResultsTitle}>
            Search Results ({searchResults.articles.length + searchResults.faqs.length})
          </Text>
          <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
            <Ionicons name="close-circle" size={20} color="#666" />
        </TouchableOpacity>
        </View>

        {isSearching ? (
          <View style={styles.searchLoading}>
            <ActivityIndicator size="small" color="#1976D2" />
            <Text style={styles.searchLoadingText}>Searching...</Text>
          </View>
        ) : (
          <>
            {/* Search Results - Articles */}
            {searchResults.articles.map((article) => (
              <TouchableOpacity
                key={article.id}
                style={styles.searchResultItem}
                onPress={() => toggleArticle(article.id)}
              >
                <View style={styles.searchResultHeader}>
                  <View style={styles.searchResultIcon}>
                    <Ionicons name="document-text-outline" size={16} color="#1976D2" />
                  </View>
                  <Text style={styles.searchResultTitle}>{article.title}</Text>
                  <Ionicons
                    name={expandedArticleId === article.id ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#666"
                  />
                </View>
                {expandedArticleId === article.id && (
                  <View style={styles.searchResultContent}>
                    <Text style={styles.searchResultText}>{article.content}</Text>
                    {article.steps && article.steps.length > 0 && (
                      <View style={styles.stepsContainer}>
                        <Text style={styles.stepsTitle}>Steps:</Text>
                        {article.steps.map((step, index) => (
                          <Text key={index} style={styles.stepText}>{index + 1}. {step}</Text>
                        ))}
                      </View>
                    )}
                    {article.tips && article.tips.length > 0 && (
                      <View style={styles.tipsContainer}>
                        <Text style={styles.tipsTitle}>Tips:</Text>
                        {article.tips.map((tip, index) => (
                          <Text key={index} style={styles.tipText}>• {tip}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {/* Search Results - FAQs */}
            {searchResults.faqs.map((faq) => (
              <TouchableOpacity
                key={faq.id}
                style={styles.searchResultItem}
                onPress={() => toggleFaq(faq.id)}
              >
                <View style={styles.searchResultHeader}>
                  <View style={styles.searchResultIcon}>
                    <Ionicons name="help-circle-outline" size={16} color="#FF9800" />
                  </View>
                  <Text style={styles.searchResultTitle}>{faq.question}</Text>
                  <Ionicons
                    name={expandedFaqId === faq.id ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#666"
                  />
                </View>
                {expandedFaqId === faq.id && (
                  <View style={styles.searchResultContent}>
                    <Text style={styles.searchResultText}>{faq.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {searchResults.articles.length === 0 && searchResults.faqs.length === 0 && (
              <View style={styles.noResults}>
                <Ionicons name="search-outline" size={48} color="#CCC" />
                <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
                <Text style={styles.noResultsSubtext}>Try different keywords or browse categories</Text>
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  const renderBrowseContent = () => {
    return (
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.tint]}
            tintColor={colors.tint}
            progressBackgroundColor={colors.background}
          />
        }>
        <Text style={styles.sectionTitle}>Browse by Feature</Text>
        
        <View style={styles.categoriesGrid}>
          {helpCategories.map((category) => (
            <TouchableOpacity 
              key={category.id} 
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category.id)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                <Ionicons name={category.icon as any} size={24} color={category.color} />
          </View>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
              <Text style={styles.categoryCount}>{category.articleIds.length} articles</Text>
            </TouchableOpacity>
          ))}
          </View>

        {/* Show articles for selected category */}
        {selectedCategory && (
          <View style={styles.articlesSection}>
            <View style={styles.articlesHeader}>
              <Text style={styles.articlesTitle}>
                {[...helpCategories, ...taskCategories].find(cat => cat.id === selectedCategory)?.title} Articles
              </Text>
              <TouchableOpacity onPress={() => setSelectedCategory(null)} style={styles.closeButton}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            {getCategoryArticles(selectedCategory).map((article) => (
              <TouchableOpacity
                key={article.id}
                style={styles.articleItem}
                onPress={() => toggleArticle(article.id)}
              >
                <View style={styles.articleHeader}>
                  <View style={styles.articleIcon}>
                    <Ionicons name="document-text-outline" size={16} color="#1976D2" />
                  </View>
                  <Text style={styles.articleTitle}>{article.title}</Text>
                  <Ionicons
                    name={expandedArticleId === article.id ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#666"
                  />
                </View>
                {expandedArticleId === article.id && (
                  <View style={styles.articleContent}>
                    <Text style={styles.articleText}>{article.content}</Text>
                    {article.steps && article.steps.length > 0 && (
                      <View style={styles.stepsContainer}>
                        <Text style={styles.stepsTitle}>Steps:</Text>
                        {article.steps.map((step, index) => (
                          <Text key={index} style={styles.stepText}>{index + 1}. {step}</Text>
                        ))}
                      </View>
                    )}
                    {article.tips && article.tips.length > 0 && (
                      <View style={styles.tipsContainer}>
                        <Text style={styles.tipsTitle}>Tips:</Text>
                        {article.tips.map((tip, index) => (
                          <Text key={index} style={styles.tipText}>• {tip}</Text>
                        ))}
                      </View>
                    )}
            </View>
                )}
          </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderTasksContent = () => {
    return (
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.tint]}
            tintColor={colors.tint}
            progressBackgroundColor={colors.background}
          />
        }>
        <Text style={styles.sectionTitle}>Browse by Task</Text>
        
        <View style={styles.categoriesGrid}>
          {taskCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category.id)}
            >
                <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                  <Ionicons name={category.icon as any} size={24} color={category.color} />
                </View>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Text style={styles.categoryDescription}>{category.description}</Text>
              <Text style={styles.categoryCount}>{category.articleIds.length} articles</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Show articles for selected category */}
        {selectedCategory && (
          <View style={styles.articlesSection}>
            <View style={styles.articlesHeader}>
              <Text style={styles.articlesTitle}>
                {[...helpCategories, ...taskCategories].find(cat => cat.id === selectedCategory)?.title} Articles
              </Text>
              <TouchableOpacity onPress={() => setSelectedCategory(null)} style={styles.closeButton}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            {getCategoryArticles(selectedCategory).map((article) => (
              <TouchableOpacity
                key={article.id}
                style={styles.articleItem}
                onPress={() => toggleArticle(article.id)}
              >
                <View style={styles.articleHeader}>
                  <View style={styles.articleIcon}>
                    <Ionicons name="document-text-outline" size={16} color="#1976D2" />
                  </View>
                  <Text style={styles.articleTitle}>{article.title}</Text>
                  <Ionicons
                    name={expandedArticleId === article.id ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#666"
                  />
                </View>
                {expandedArticleId === article.id && (
                  <View style={styles.articleContent}>
                    <Text style={styles.articleText}>{article.content}</Text>
                    {article.steps && article.steps.length > 0 && (
                      <View style={styles.stepsContainer}>
                        <Text style={styles.stepsTitle}>Steps:</Text>
                        {article.steps.map((step, index) => (
                          <Text key={index} style={styles.stepText}>{index + 1}. {step}</Text>
                        ))}
                      </View>
                    )}
                    {article.tips && article.tips.length > 0 && (
                      <View style={styles.tipsContainer}>
                        <Text style={styles.tipsTitle}>Tips:</Text>
                        {article.tips.map((tip, index) => (
                          <Text key={index} style={styles.tipText}>• {tip}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderFaqContent = () => {
    const popularFaqs = faqs.slice(0, 10);

    return (
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.tint]}
            tintColor={colors.tint}
            progressBackgroundColor={colors.background}
          />
        }>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        <View style={styles.faqContainer}>
          {popularFaqs.map((faq) => (
                <TouchableOpacity
              key={faq.id}
              style={styles.faqItem}
              onPress={() => toggleFaq(faq.id)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons
                  name={expandedFaqId === faq.id ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#666"
                />
              </View>
              {expandedFaqId === faq.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
              )}
                </TouchableOpacity>
              ))}
        </View>
            </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1976D2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results */}
      {renderSearchResults()}

      {/* Tabs */}
      {!searchQuery.trim() && (
        <>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'browse' && styles.activeTab]}
              onPress={() => setActiveTab('browse')}
            >
              <Text style={[styles.tabText, activeTab === 'browse' && styles.activeTabText]}>
                Browse by Feature
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'tasks' && styles.activeTab]}
              onPress={() => setActiveTab('tasks')}
            >
              <Text style={[styles.tabText, activeTab === 'tasks' && styles.activeTabText]}>
                Browse by Task
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'faq' && styles.activeTab]}
              onPress={() => setActiveTab('faq')}
            >
              <Text style={[styles.tabText, activeTab === 'faq' && styles.activeTabText]}>
                FAQ
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'browse' && renderBrowseContent()}
          {activeTab === 'tasks' && renderTasksContent()}
          {activeTab === 'faq' && renderFaqContent()}
        </>
      )}

          {/* Contact Support */}
      {!searchQuery.trim() && (
            <View style={styles.contactCard}>
          <View style={styles.contactIcon}>
            <Ionicons name="headset-outline" size={20} color="#1976D2" />
          </View>
              <Text style={styles.contactTitle}>Still need help?</Text>
              <Text style={styles.contactDescription}>
            Contact our support team for additional assistance
              </Text>
              <TouchableOpacity style={styles.contactButton}>
                <Text style={styles.contactButtonText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
      )}
          </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  clearButton: {
    marginLeft: 8,
  },
  searchResults: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  clearSearchButton: {
    padding: 4,
  },
  searchLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  searchLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  searchResultItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  searchResultIcon: {
    marginRight: 12,
  },
  searchResultTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  searchResultContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchResultText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 12,
  },
  stepsContainer: {
    marginBottom: 12,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 4,
  },
  tipsContainer: {
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 4,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#1976D2',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  categoryCount: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  faqContainer: {
    paddingBottom: 20,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    margin: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  contactIcon: {
    marginBottom: 4,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 14,
  },
  contactButton: {
    backgroundColor: '#1976D2',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  contactButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  articlesSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  articlesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  articlesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    padding: 4,
  },
  articleItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  articleIcon: {
    marginRight: 12,
  },
  articleTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  articleContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  articleText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 12,
  },
});