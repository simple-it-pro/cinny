import React, { useState, useEffect } from 'react';
import { Input, toRem } from 'folds';
import { isKeyHotkey } from 'is-hotkey';
import './Settings.scss';
import { useTranslation } from 'react-i18next';

import i18next from 'i18next';
import { clearCacheAndReload, logoutClient } from '../../../client/initMatrix';
import cons from '../../../client/state/cons';
import settings from '../../../client/state/settings';
import navigation from '../../../client/state/navigation';
import { toggleSystemTheme } from '../../../client/action/settings';
import { usePermissionState } from '../../hooks/usePermission';

import Text from '../../atoms/text/Text';
import IconButton from '../../atoms/button/IconButton';
import Button from '../../atoms/button/Button';
import Toggle from '../../atoms/button/Toggle';
import Tabs from '../../atoms/tabs/Tabs';
import { MenuHeader } from '../../atoms/context-menu/ContextMenu';
import SegmentedControls from '../../atoms/segmented-controls/SegmentedControls';

import PopupWindow from '../../molecules/popup-window/PopupWindow';
import SettingTile from '../../molecules/setting-tile/SettingTile';
import ImportE2ERoomKeys from '../../molecules/import-export-e2e-room-keys/ImportE2ERoomKeys';
import ExportE2ERoomKeys from '../../molecules/import-export-e2e-room-keys/ExportE2ERoomKeys';
import { ImagePackUser, ImagePackGlobal } from '../../molecules/image-pack/ImagePack';
import GlobalNotification from '../../molecules/global-notification/GlobalNotification';
import KeywordNotification from '../../molecules/global-notification/KeywordNotification';
import IgnoreUserList from '../../molecules/global-notification/IgnoreUserList';

import ProfileEditor from '../profile-editor/ProfileEditor';
import CrossSigning from './CrossSigning';
import KeyBackup from './KeyBackup';
import DeviceManage from './DeviceManage';

import SunIC from '../../../../public/res/ic/outlined/sun.svg';
import EmojiIC from '../../../../public/res/ic/outlined/emoji.svg';
import LockIC from '../../../../public/res/ic/outlined/lock.svg';
import BellIC from '../../../../public/res/ic/outlined/bell.svg';
import InfoIC from '../../../../public/res/ic/outlined/info.svg';
import PowerIC from '../../../../public/res/ic/outlined/power.svg';
import CrossIC from '../../../../public/res/ic/outlined/cross.svg';

import CinnySVG from '../../../../public/res/svg/cinny.svg';
import { confirmDialog } from '../../molecules/confirm-dialog/ConfirmDialog';
import { useSetting } from '../../state/hooks/settings';
import { settingsAtom } from '../../state/settings';
import { isMacOS } from '../../utils/user-agent';
import { KeySymbol } from '../../utils/key-symbol';
import { useMatrixClient } from '../../hooks/useMatrixClient';

function AppearanceSection() {
  const { t } = useTranslation();
  const [, updateState] = useState({});

  const [enterForNewline, setEnterForNewline] = useSetting(settingsAtom, 'enterForNewline');
  const [messageLayout, setMessageLayout] = useSetting(settingsAtom, 'messageLayout');
  const [messageSpacing, setMessageSpacing] = useSetting(settingsAtom, 'messageSpacing');
  const [twitterEmoji, setTwitterEmoji] = useSetting(settingsAtom, 'twitterEmoji');
  const [pageZoom, setPageZoom] = useSetting(settingsAtom, 'pageZoom');
  const [isMarkdown, setIsMarkdown] = useSetting(settingsAtom, 'isMarkdown');
  const [hideMembershipEvents, setHideMembershipEvents] = useSetting(
    settingsAtom,
    'hideMembershipEvents'
  );
  const [hideNickAvatarEvents, setHideNickAvatarEvents] = useSetting(
    settingsAtom,
    'hideNickAvatarEvents'
  );
  const [mediaAutoLoad, setMediaAutoLoad] = useSetting(settingsAtom, 'mediaAutoLoad');
  const [urlPreview, setUrlPreview] = useSetting(settingsAtom, 'urlPreview');
  const [encUrlPreview, setEncUrlPreview] = useSetting(settingsAtom, 'encUrlPreview');
  const [showHiddenEvents, setShowHiddenEvents] = useSetting(settingsAtom, 'showHiddenEvents');
  const spacings = ['0', '100', '200', '300', '400', '500'];

  const [currentZoom, setCurrentZoom] = useState(`${pageZoom}`);

  const handleZoomChange = (evt) => {
    setCurrentZoom(evt.target.value);
  };

  const handleZoomEnter = (evt) => {
    if (isKeyHotkey('escape', evt)) {
      evt.stopPropagation();
      setCurrentZoom(pageZoom);
    }
    if (isKeyHotkey('enter', evt)) {
      const newZoom = parseInt(evt.target.value, 10);
      if (Number.isNaN(newZoom)) return;
      const safeZoom = Math.max(Math.min(newZoom, 150), 75);
      setPageZoom(safeZoom);
      setCurrentZoom(safeZoom);
    }
  };

  const handleLanguageChange = (index) => {
    const langs = ['en', 'ru'];
    i18next.changeLanguage(langs[index]);
    updateState({});
  };

  const getCurrentLangIndex = () => {
    const lang = i18next.language?.substring(0, 2);
    return lang === 'ru' ? 1 : 0;
  };

  return (
    <div className="settings-appearance">
      <div className="settings-appearance__card">
        <MenuHeader>{t('settings.language', 'Language')}</MenuHeader>
        <SettingTile
          title={t('settings.languageSelect', 'Interface language')}
          content={
            <SegmentedControls
              selected={getCurrentLangIndex()}
              segments={[
                { text: 'English' },
                { text: 'Русский' },
              ]}
              onSelect={handleLanguageChange}
            />
          }
        />
      </div>
      <div className="settings-appearance__card">
        <MenuHeader>{t('settings.appearance.theme')}</MenuHeader>
        <SettingTile
          title={t('settings.appearance.followSystemTheme')}
          options={
            <Toggle
              isActive={settings.useSystemTheme}
              onToggle={() => {
                toggleSystemTheme();
                updateState({});
              }}
            />
          }
          content={<Text variant="b3">{t('settings.appearance.followSystemThemeDescription')}</Text>}
        />
        <SettingTile
          title={t('settings.appearance.theme')}
          content={
            <SegmentedControls
              selected={settings.useSystemTheme ? -1 : settings.getThemeIndex()}
              segments={[
                { text: t('settings.appearance.themeLight') },
                { text: t('settings.appearance.themeSilver') },
                { text: t('settings.appearance.themeDark') },
                { text: t('settings.appearance.themeButter') },
              ]}
              onSelect={(index) => {
                if (settings.useSystemTheme) toggleSystemTheme();
                settings.setTheme(index);
                updateState({});
              }}
            />
          }
        />
        <SettingTile
          title={t('settings.appearance.useTwitterEmoji')}
          options={
            <Toggle isActive={twitterEmoji} onToggle={() => setTwitterEmoji(!twitterEmoji)} />
          }
          content={<Text variant="b3">{t('settings.appearance.useTwitterEmojiDescription')}</Text>}
        />
        <SettingTile
          title={t('settings.appearance.pageZoom')}
          options={
            <Input
              style={{ width: toRem(150) }}
              variant={pageZoom === parseInt(currentZoom, 10) ? 'Background' : 'Primary'}
              size="400"
              type="number"
              min="75"
              max="150"
              value={currentZoom}
              onChange={handleZoomChange}
              onKeyDown={handleZoomEnter}
              outlined
              after={<Text variant="b2">%</Text>}
            />
          }
          content={
            <Text variant="b3">
              {t('settings.appearance.pageZoomDescription')}
            </Text>
          }
        />
      </div>
      <div className="settings-appearance__card">
        <MenuHeader>{t('settings.appearance.roomMessages')}</MenuHeader>
        <SettingTile
          title={t('settings.appearance.messageLayout')}
          content={
            <SegmentedControls
              selected={messageLayout}
              segments={[{ text: t('settings.appearance.layoutModern') }, { text: t('settings.appearance.layoutCompact') }, { text: t('settings.appearance.layoutBubble') }]}
              onSelect={(index) => setMessageLayout(index)}
            />
          }
        />
        <SettingTile
          title={t('settings.appearance.messageSpacing')}
          content={
            <SegmentedControls
              selected={spacings.findIndex((s) => s === messageSpacing)}
              segments={[
                { text: t('settings.appearance.spacingNo') },
                { text: t('settings.appearance.spacingXXS') },
                { text: t('settings.appearance.spacingXS') },
                { text: t('settings.appearance.spacingS') },
                { text: t('settings.appearance.spacingM') },
                { text: t('settings.appearance.spacingL') },
              ]}
              onSelect={(index) => {
                setMessageSpacing(spacings[index]);
              }}
            />
          }
        />
        <SettingTile
          title={t('settings.appearance.useEnterForNewline')}
          options={
            <Toggle
              isActive={enterForNewline}
              onToggle={() => setEnterForNewline(!enterForNewline)}
            />
          }
          content={
            <Text variant="b3">{t('settings.appearance.useEnterForNewlineDescription', { modifier: isMacOS() ? KeySymbol.Command : 'Ctrl' })}</Text>
          }
        />
        <SettingTile
          title={t('settings.appearance.markdownFormatting')}
          options={<Toggle isActive={isMarkdown} onToggle={() => setIsMarkdown(!isMarkdown)} />}
          content={<Text variant="b3">{t('settings.appearance.markdownFormattingDescription')}</Text>}
        />
        <SettingTile
          title={t('settings.appearance.hideMembershipEvents')}
          options={
            <Toggle
              isActive={hideMembershipEvents}
              onToggle={() => setHideMembershipEvents(!hideMembershipEvents)}
            />
          }
          content={
            <Text variant="b3">
              {t('settings.appearance.hideMembershipEventsDescription')}
            </Text>
          }
        />
        <SettingTile
          title={t('settings.appearance.hideNickAvatarEvents')}
          options={
            <Toggle
              isActive={hideNickAvatarEvents}
              onToggle={() => setHideNickAvatarEvents(!hideNickAvatarEvents)}
            />
          }
          content={
            <Text variant="b3">{t('settings.appearance.hideNickAvatarEventsDescription')}</Text>
          }
        />
        <SettingTile
          title={t('settings.appearance.disableMediaAutoLoad')}
          options={
            <Toggle isActive={!mediaAutoLoad} onToggle={() => setMediaAutoLoad(!mediaAutoLoad)} />
          }
          content={
            <Text variant="b3">{t('settings.appearance.disableMediaAutoLoadDescription')}</Text>
          }
        />
        <SettingTile
          title={t('settings.appearance.urlPreview')}
          options={<Toggle isActive={urlPreview} onToggle={() => setUrlPreview(!urlPreview)} />}
          content={<Text variant="b3">{t('settings.appearance.urlPreviewDescription')}</Text>}
        />
        <SettingTile
          title={t('settings.appearance.urlPreviewEncrypted')}
          options={
            <Toggle isActive={encUrlPreview} onToggle={() => setEncUrlPreview(!encUrlPreview)} />
          }
          content={<Text variant="b3">{t('settings.appearance.urlPreviewEncryptedDescription')}</Text>}
        />
        <SettingTile
          title={t('settings.appearance.showHiddenEvents')}
          options={
            <Toggle
              isActive={showHiddenEvents}
              onToggle={() => setShowHiddenEvents(!showHiddenEvents)}
            />
          }
          content={<Text variant="b3">{t('settings.appearance.showHiddenEventsDescription')}</Text>}
        />
      </div>
    </div>
  );
}

function NotificationsSection() {
  const { t } = useTranslation();
  const notifPermission = usePermissionState(
    'notifications',
    window.Notification?.permission ?? 'denied'
  );
  const [showNotifications, setShowNotifications] = useSetting(settingsAtom, 'showNotifications');
  const [isNotificationSounds, setIsNotificationSounds] = useSetting(
    settingsAtom,
    'isNotificationSounds'
  );

  const renderOptions = () => {
    if (window.Notification === undefined) {
      return (
        <Text className="settings-notifications__not-supported">
          {t('settings.notifications.notSupported')}
        </Text>
      );
    }

    if (notifPermission === 'denied') {
      return <Text>{t('settings.notifications.permissionDenied')}</Text>;
    }

    if (notifPermission === 'granted') {
      return (
        <Toggle
          isActive={showNotifications}
          onToggle={() => {
            setShowNotifications(!showNotifications);
          }}
        />
      );
    }

    return (
      <Button
        variant="primary"
        onClick={() =>
          window.Notification.requestPermission().then(() => {
            setShowNotifications(window.Notification?.permission === 'granted');
          })
        }
      >
        {t('settings.notifications.requestPermission')}
      </Button>
    );
  };

  return (
    <>
      <div className="settings-notifications">
        <MenuHeader>{t('settings.notifications.sectionTitle')}</MenuHeader>
        <SettingTile
          title={t('settings.notifications.desktopNotification')}
          options={renderOptions()}
          content={<Text variant="b3">{t('settings.notifications.desktopNotificationDescription')}</Text>}
        />
        <SettingTile
          title={t('settings.notifications.notificationSound')}
          options={
            <Toggle
              isActive={isNotificationSounds}
              onToggle={() => setIsNotificationSounds(!isNotificationSounds)}
            />
          }
          content={<Text variant="b3">{t('settings.notifications.notificationSoundDescription')}</Text>}
        />
      </div>
      <GlobalNotification />
      <KeywordNotification />
      <IgnoreUserList />
    </>
  );
}

function EmojiSection() {
  return (
    <>
      <div className="settings-emoji__card">
        <ImagePackUser />
      </div>
      <div className="settings-emoji__card">
        <ImagePackGlobal />
      </div>
    </>
  );
}

function SecuritySection() {
  const { t } = useTranslation();
  return (
    <div className="settings-security">
      <div className="settings-security__card">
        <MenuHeader>{t('settings.security.crossSigningAndBackup')}</MenuHeader>
        <CrossSigning />
        <KeyBackup />
      </div>
      <DeviceManage />
      <div className="settings-security__card">
        <MenuHeader>{t('settings.security.exportImportKeys')}</MenuHeader>
        <SettingTile
          title={t('settings.security.exportE2EKeys')}
          content={
            <>
              <Text variant="b3">
                {t('settings.security.exportE2EKeysDescription')}
              </Text>
              <ExportE2ERoomKeys />
            </>
          }
        />
        <SettingTile
          title={t('settings.security.importE2EKeys')}
          content={
            <>
              <Text variant="b3">
                {t('settings.security.importE2EKeysDescription')}
              </Text>
              <ImportE2ERoomKeys />
            </>
          }
        />
      </div>
    </div>
  );
}

function AboutSection() {
  const { t } = useTranslation();
  const mx = useMatrixClient();

  return (
    <div className="settings-about">
      <div className="settings-about__card">
        <MenuHeader>{t('settings.about.application')}</MenuHeader>
        <div className="settings-about__branding">
          <img width="60" height="60" src={CinnySVG} alt="Simple logo" />
          <div>
            <Text variant="h2" weight="medium">
              Simple
              <span
                className="text text-b3"
                style={{ margin: '0 var(--sp-extra-tight)' }}
              >{`v${cons.version}`}</span>
            </Text>
            <Text>{t('settings.about.description', 'Messenger by Simple IT')}</Text>

            <div className="settings-about__btns">
              <Button onClick={() => clearCacheAndReload(mx)} variant="danger">
                {t('settings.about.clearCacheReload')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="settings-about__card">
        <MenuHeader>{t('settings.about.credits')}</MenuHeader>
        <div className="settings-about__credits">
          <ul>
            <li>
              {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
              <Text>
                The{' '}
                <a
                  href="https://github.com/matrix-org/matrix-js-sdk"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  matrix-js-sdk
                </a>{' '}
                is ©{' '}
                <a href="https://matrix.org/foundation" rel="noreferrer noopener" target="_blank">
                  The Matrix.org Foundation C.I.C
                </a>{' '}
                used under the terms of{' '}
                <a
                  href="http://www.apache.org/licenses/LICENSE-2.0"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Apache 2.0
                </a>
                .
              </Text>
            </li>
            <li>
              {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
              <Text>
                The{' '}
                <a
                  href="https://github.com/mozilla/twemoji-colr"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  twemoji-colr
                </a>{' '}
                font is ©{' '}
                <a href="https://mozilla.org/" target="_blank" rel="noreferrer noopener">
                  Mozilla Foundation
                </a>{' '}
                used under the terms of{' '}
                <a
                  href="http://www.apache.org/licenses/LICENSE-2.0"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Apache 2.0
                </a>
                .
              </Text>
            </li>
            <li>
              {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
              <Text>
                The{' '}
                <a href="https://twemoji.twitter.com" target="_blank" rel="noreferrer noopener">
                  Twemoji
                </a>{' '}
                emoji art is ©{' '}
                <a href="https://twemoji.twitter.com" target="_blank" rel="noreferrer noopener">
                  Twitter, Inc and other contributors
                </a>{' '}
                used under the terms of{' '}
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  CC-BY 4.0
                </a>
                .
              </Text>
            </li>
            <li>
              {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
              <Text>
                The{' '}
                <a
                  href="https://material.io/design/sound/sound-resources.html"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Material sound resources
                </a>{' '}
                are ©{' '}
                <a href="https://google.com" target="_blank" rel="noreferrer noopener">
                  Google
                </a>{' '}
                used under the terms of{' '}
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  CC-BY 4.0
                </a>
                .
              </Text>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export const tabText = {
  get APPEARANCE() { return i18next.t('settings.tabs.appearance', 'Appearance'); },
  get NOTIFICATIONS() { return i18next.t('settings.tabs.notifications', 'Notifications'); },
  get EMOJI() { return i18next.t('settings.tabs.emoji', 'Emoji'); },
  get SECURITY() { return i18next.t('settings.tabs.security', 'Security'); },
  get ABOUT() { return i18next.t('settings.tabs.about', 'About'); },
};
const getTabItems = () => [
  {
    text: tabText.APPEARANCE,
    iconSrc: SunIC,
    disabled: false,
    render: () => <AppearanceSection />,
  },
  {
    text: tabText.NOTIFICATIONS,
    iconSrc: BellIC,
    disabled: false,
    render: () => <NotificationsSection />,
  },
  {
    text: tabText.EMOJI,
    iconSrc: EmojiIC,
    disabled: false,
    render: () => <EmojiSection />,
  },
  {
    text: tabText.SECURITY,
    iconSrc: LockIC,
    disabled: false,
    render: () => <SecuritySection />,
  },
  {
    text: tabText.ABOUT,
    iconSrc: InfoIC,
    disabled: false,
    render: () => <AboutSection />,
  },
];

function useWindowToggle(setSelectedTab) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const openSettings = (tab) => {
      const currentTabItems = getTabItems();
      const tabItem = currentTabItems.find((item) => item.text === tab);
      if (tabItem) setSelectedTab(tabItem);
      setIsOpen(true);
    };
    navigation.on(cons.events.navigation.SETTINGS_OPENED, openSettings);
    return () => {
      navigation.removeListener(cons.events.navigation.SETTINGS_OPENED, openSettings);
    };
  }, []);

  const requestClose = () => setIsOpen(false);

  return [isOpen, requestClose];
}

function Settings() {
  const { t } = useTranslation();
  const tabItems = getTabItems();
  const [selectedTab, setSelectedTab] = useState(tabItems[0]);
  const [isOpen, requestClose] = useWindowToggle(setSelectedTab);
  const mx = useMatrixClient();

  const handleTabChange = (tabItem) => setSelectedTab(tabItem);
  const handleLogout = async () => {
    if (
      await confirmDialog(
        t('settings.logoutConfirmTitle'),
        t('settings.logoutConfirmMessage'),
        t('settings.logout'),
        'danger'
      )
    ) {
      logoutClient(mx);
    }
  };

  return (
    <PopupWindow
      isOpen={isOpen}
      className="settings-window"
      title={
        <Text variant="s1" weight="medium" primary>
          {t('settings.title')}
        </Text>
      }
      contentOptions={
        <>
          <Button variant="danger" iconSrc={PowerIC} onClick={handleLogout}>
            {t('settings.logout')}
          </Button>
          <IconButton src={CrossIC} onClick={requestClose} tooltip="Close" />
        </>
      }
      onRequestClose={requestClose}
    >
      {isOpen && (
        <div className="settings-window__content">
          <ProfileEditor userId={mx.getUserId()} />
          <Tabs
            items={tabItems}
            defaultSelected={tabItems.findIndex((tab) => tab.text === selectedTab.text)}
            onSelect={handleTabChange}
          />
          <div className="settings-window__cards-wrapper">{selectedTab.render()}</div>
        </div>
      )}
    </PopupWindow>
  );
}

export default Settings;
