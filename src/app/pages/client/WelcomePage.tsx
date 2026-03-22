import React from 'react';
import { Box, Text, config, toRem } from 'folds';
import { useTranslation } from 'react-i18next';
import { Page, PageHero, PageHeroSection } from '../../components/page';
import CinnySVG from '../../../../public/res/svg/cinny.svg';

export function WelcomePage() {
  const { t } = useTranslation();
  return (
    <Page>
      <Box
        grow="Yes"
        style={{ padding: config.space.S400, paddingBottom: config.space.S700 }}
        alignItems="Center"
        justifyContent="Center"
      >
        <PageHeroSection>
          <PageHero
            icon={<img width="70" height="70" src={CinnySVG} alt="Simple Logo" />}
            title={t('welcome.title')}
            subTitle={
              <span>{t('welcome.subtitle')}</span>
            }
          >
            <Box justifyContent="Center">
              <Box grow="Yes" style={{ maxWidth: toRem(400) }} direction="Column" gap="300">
                <Text size="T200" align="Center" style={{ color: 'var(--tc-surface-low)' }}>
                  {t('welcome.description')}
                </Text>
              </Box>
            </Box>
          </PageHero>
        </PageHeroSection>
      </Box>
    </Page>
  );
}
