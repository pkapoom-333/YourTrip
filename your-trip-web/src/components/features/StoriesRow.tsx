"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import StoryRing from "./StoryRing";
import StoryViewer from "./StoryViewer";
import StoryUpload from "./StoryUpload";
import type { StoryGroup } from "@/server/actions/stories";

interface StoriesRowProps {
  groups: StoryGroup[];
  myUserId: string | null;
  myAvatarUrl?: string | null;
  myName?: string;
}

export default function StoriesRow({ groups, myUserId, myAvatarUrl, myName }: StoriesRowProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerGroupIdx, setViewerGroupIdx] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  // Local copy of groups so we can update viewed state after closing viewer
  const [localGroups, setLocalGroups] = useState<StoryGroup[]>(groups);

  const openViewer = (idx: number) => {
    setViewerGroupIdx(idx);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    // Refresh viewed state — mark viewed based on timing (server already tracked via markStoryViewed)
    // For now just mark all as viewed in local state when user closes
    setLocalGroups((prev) =>
      prev.map((g, i) => {
        if (i !== viewerGroupIdx) return g;
        return {
          ...g,
          allViewed: true,
          stories: g.stories.map((s) => ({ ...s, viewedByMe: true })),
        };
      })
    );
  };

  const handleStoryCreated = () => {
    setUploadOpen(false);
    // Reload page to show new story
    window.location.reload();
  };

  const myGroup = localGroups.find((g) => g.userId === myUserId);
  const otherGroups = localGroups.filter((g) => g.userId !== myUserId);

  // Reorder: own first
  const orderedGroups = myGroup ? [myGroup, ...otherGroups] : localGroups;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto scrollbar-none pb-1">
        {/* My story button */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => myGroup ? openViewer(orderedGroups.indexOf(myGroup)) : setUploadOpen(true)}
            className="relative"
          >
            <StoryRing
              avatarUrl={myAvatarUrl}
              name={myName ?? "ฉัน"}
              hasStories={!!myGroup}
              allViewed={false}
              size="md"
            />
            {!myGroup && (
              <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#398AB9] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                <Plus className="w-3 h-3 text-white" />
              </span>
            )}
          </button>
          <span className="text-[10px] text-gray-500 dark:text-slate-400 w-14 text-center truncate">
            {myGroup ? "สตอรี่ฉัน" : "เพิ่มสตอรี่"}
          </span>
        </div>

        {/* Add story button when already has story */}
        {myGroup && (
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setUploadOpen(true)}
              className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center bg-gray-50 dark:bg-slate-700"
            >
              <Plus className="w-5 h-5 text-gray-400 dark:text-slate-500" />
            </button>
            <span className="text-[10px] text-gray-500 dark:text-slate-400 w-14 text-center">เพิ่มเติม</span>
          </div>
        )}

        {/* Other users' stories */}
        {otherGroups.map((group) => {
          const idx = orderedGroups.indexOf(group);
          return (
            <div key={group.userId} className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <StoryRing
                avatarUrl={group.userAvatarUrl}
                name={group.userName}
                hasStories={group.stories.length > 0}
                allViewed={group.allViewed}
                size="md"
                onClick={() => openViewer(idx)}
              />
              <span className="text-[10px] text-gray-500 dark:text-slate-400 w-14 text-center truncate">
                {group.userName.split(" ")[0]}
              </span>
            </div>
          );
        })}

        {/* Empty state — no stories at all */}
        {localGroups.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-slate-500 self-center ml-2">
            ยังไม่มีสตอรี่ เป็นคนแรกที่โพสต์!
          </p>
        )}
      </div>

      {/* StoryViewer overlay */}
      {viewerOpen && (
        <StoryViewer
          groups={orderedGroups}
          initialGroupIndex={viewerGroupIdx}
          myUserId={myUserId}
          onClose={closeViewer}
        />
      )}

      {/* Upload modal */}
      {uploadOpen && (
        <StoryUpload
          onClose={() => setUploadOpen(false)}
          onCreated={handleStoryCreated}
        />
      )}
    </>
  );
}
