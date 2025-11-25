import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ChatMessage } from "@/hooks/use-section-chat";

export interface CachedChatData {
	messages: ChatMessage[];
	conversationId: string;
	participantsMap: Record<string, { full_name: string; email?: string; role?: string }>;
	cachedAt: number; // timestamp in milliseconds
	version: number; // for future migrations
}

const CACHE_VERSION = 1;
const DEFAULT_MAX_AGE = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_KEY_PREFIX = "chat:section:";

/**
 * Get cache key for a conversation
 */
function getCacheKey(conversationId: string): string {
	return `${CACHE_KEY_PREFIX}${conversationId}`;
}

/**
 * Check if cache is still valid based on timestamp
 */
export function isCacheValid(timestamp: number, maxAge: number = DEFAULT_MAX_AGE): boolean {
	const now = Date.now();
	const age = now - timestamp;
	return age < maxAge;
}

/**
 * Load cached chat data for a conversation
 */
export async function getCachedChat(conversationId: string): Promise<CachedChatData | null> {
	try {
		const key = getCacheKey(conversationId);
		const cached = await AsyncStorage.getItem(key);
		
		if (!cached) {
			if (__DEV__) console.log("[chat-cache] No cache found for conversation:", conversationId);
			return null;
		}

		const data: CachedChatData = JSON.parse(cached);
		
		// Check version compatibility
		if (data.version !== CACHE_VERSION) {
			if (__DEV__) console.warn("[chat-cache] Cache version mismatch, clearing cache:", data.version, "expected", CACHE_VERSION);
			await clearChatCache(conversationId);
			return null;
		}

		// Check if cache is still valid
		if (!isCacheValid(data.cachedAt)) {
			if (__DEV__) console.log("[chat-cache] Cache expired for conversation:", conversationId);
			return null;
		}

		if (__DEV__) {
			console.log("[chat-cache] Loaded cache for conversation:", conversationId, "messages:", data.messages.length, "age:", Math.round((Date.now() - data.cachedAt) / 1000), "s");
		}

		return data;
	} catch (error) {
		console.error("[chat-cache] Error loading cache:", error);
		return null;
	}
}

/**
 * Save chat data to cache
 */
export async function setCachedChat(conversationId: string, data: Omit<CachedChatData, "cachedAt" | "version">): Promise<void> {
	try {
		const key = getCacheKey(conversationId);
		const cacheData: CachedChatData = {
			...data,
			cachedAt: Date.now(),
			version: CACHE_VERSION,
		};

		// Limit messages to last 100 (same as API limit)
		const limitedMessages = data.messages.slice(-100);

		const finalData: CachedChatData = {
			...cacheData,
			messages: limitedMessages,
		};

		await AsyncStorage.setItem(key, JSON.stringify(finalData));

		if (__DEV__) {
			console.log("[chat-cache] Saved cache for conversation:", conversationId, "messages:", limitedMessages.length);
		}
	} catch (error) {
		console.error("[chat-cache] Error saving cache:", error);
		// Don't throw - cache errors shouldn't break functionality
	}
}

/**
 * Clear chat cache for a specific conversation or all conversations
 */
export async function clearChatCache(conversationId?: string): Promise<void> {
	try {
		if (conversationId) {
			const key = getCacheKey(conversationId);
			await AsyncStorage.removeItem(key);
			if (__DEV__) console.log("[chat-cache] Cleared cache for conversation:", conversationId);
		} else {
			// Clear all chat caches
			const keys = await AsyncStorage.getAllKeys();
			const chatKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
			await AsyncStorage.multiRemove(chatKeys);
			if (__DEV__) console.log("[chat-cache] Cleared all chat caches:", chatKeys.length);
		}
	} catch (error) {
		console.error("[chat-cache] Error clearing cache:", error);
	}
}

/**
 * Update cache with new messages (merge with existing)
 */
export async function updateCachedChatMessages(
	conversationId: string,
	newMessages: ChatMessage[],
	mergeStrategy: "append" | "replace" = "append"
): Promise<void> {
	try {
		const existing = await getCachedChat(conversationId);
		
		if (!existing) {
			// No existing cache, create new one
			await setCachedChat(conversationId, {
				messages: newMessages,
				conversationId,
				participantsMap: {},
			});
			return;
		}

		let mergedMessages: ChatMessage[];
		if (mergeStrategy === "replace") {
			mergedMessages = newMessages;
		} else {
			// Append strategy: merge and deduplicate by id
			const messageMap = new Map<string, ChatMessage>();
			
			// Add existing messages
			existing.messages.forEach(msg => messageMap.set(msg.id, msg));
			
			// Add/update with new messages (newer messages override older ones)
			newMessages.forEach(msg => {
				const existing = messageMap.get(msg.id);
				if (!existing || new Date(msg.created_at) > new Date(existing.created_at)) {
					messageMap.set(msg.id, msg);
				}
			});
			
			// Convert back to array and sort by created_at
			mergedMessages = Array.from(messageMap.values()).sort(
				(a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
			);
		}

		await setCachedChat(conversationId, {
			messages: mergedMessages,
			conversationId: existing.conversationId,
			participantsMap: existing.participantsMap,
		});

		if (__DEV__) {
			console.log("[chat-cache] Updated cache for conversation:", conversationId, "messages:", mergedMessages.length);
		}
	} catch (error) {
		console.error("[chat-cache] Error updating cache:", error);
	}
}

