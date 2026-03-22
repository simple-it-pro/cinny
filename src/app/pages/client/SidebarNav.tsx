import React, { useRef } from 'react';
import { Icon, Icons, Scroll } from 'folds';
import { useTranslation } from 'react-i18next';

import {
  Sidebar,
  SidebarContent,
  SidebarStackSeparator,
  SidebarStack,
  SidebarAvatar,
  SidebarItemTooltip,
  SidebarItem,
} from '../../components/sidebar';
import {
  DirectTab,
  HomeTab,
  SpaceTabs,
  InboxTab,
  ExploreTab,
  UserTab,
  UnverifiedTab,
} from './sidebar';
import { openCreateRoom, openSearch } from '../../../client/action/navigation';

export function SidebarNav() {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <Sidebar>
      <SidebarContent
        scrollable={
          <Scroll ref={scrollRef} variant="Background" size="0">
            <SidebarStack>
              <HomeTab />
              <DirectTab />
            </SidebarStack>
            <SpaceTabs scrollRef={scrollRef} />
            <SidebarStackSeparator />
            <SidebarStack>
              <ExploreTab />
              <SidebarItem>
                <SidebarItemTooltip tooltip={t('nav.createSpace')}>
                  {(triggerRef) => (
                    <SidebarAvatar
                      as="button"
                      ref={triggerRef}
                      outlined
                      onClick={() => openCreateRoom(true)}
                    >
                      <Icon src={Icons.Plus} />
                    </SidebarAvatar>
                  )}
                </SidebarItemTooltip>
              </SidebarItem>
            </SidebarStack>
          </Scroll>
        }
        sticky={
          <>
            <SidebarStackSeparator />
            <SidebarStack>
              <SidebarItem>
                <SidebarItemTooltip tooltip={t('nav.search')}>
                  {(triggerRef) => (
                    <SidebarAvatar
                      as="button"
                      ref={triggerRef}
                      outlined
                      onClick={() => openSearch()}
                    >
                      <Icon src={Icons.Search} />
                    </SidebarAvatar>
                  )}
                </SidebarItemTooltip>
              </SidebarItem>

              <UnverifiedTab />

              <InboxTab />
              <UserTab />
            </SidebarStack>
          </>
        }
      />
    </Sidebar>
  );
}
