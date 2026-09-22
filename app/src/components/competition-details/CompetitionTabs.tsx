import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card } from '../common/Card';
import { colors, radius, spacing, typography } from '../../constants/theme';

interface CompetitionTabsProps {
  description: string;
  descriptionFull?: string;
  judgingParameters?: string[];
  rulesAndEligibility?: string[];
}

export const CompetitionTabs: React.FC<CompetitionTabsProps> = ({
  description,
  descriptionFull,
  judgingParameters = [],
  rulesAndEligibility = [],
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'about' | 'judging' | 'rules'>('about');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card padding="lg" style={styles.card}>
      {/* Tab Navigation Headers */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'about' && styles.activeTabItem]}
          onPress={() => setActiveTab('about')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
            {t('aboutCompetition')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'judging' && styles.activeTabItem]}
          onPress={() => setActiveTab('judging')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'judging' && styles.activeTabText]}>
            {t('judgingParameters')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'rules' && styles.activeTabItem]}
          onPress={() => setActiveTab('rules')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'rules' && styles.activeTabText]}>
            {t('rulesEligibility')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {activeTab === 'about' && (
          <View>
            <Text style={styles.bodyText}>
              {isExpanded && descriptionFull ? descriptionFull : description}
            </Text>

            {descriptionFull && descriptionFull !== description && (
              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.7}
              >
                <Text style={styles.expandText}>
                  {isExpanded ? t('viewLess') : t('viewMore')}
                </Text>
                <Feather
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.primary}
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {activeTab === 'judging' && (
          <View style={styles.bulletList}>
            {judgingParameters.map((param, idx) => (
              <View key={idx} style={styles.bulletItem}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{param}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'rules' && (
          <View style={styles.bulletList}>
            {rulesAndEligibility.map((rule, idx) => (
              <View key={idx} style={styles.bulletItem}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{rule}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    marginBottom: spacing.md,
  },
  tabItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    marginRight: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '700',
  },
  contentContainer: {
    paddingTop: spacing.xs,
  },
  bodyText: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: '#374151',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  expandText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  bulletList: {
    paddingTop: spacing.xs,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    marginTop: 7,
    marginRight: spacing.sm,
  },
  bulletText: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
    color: '#374151',
  },
});
