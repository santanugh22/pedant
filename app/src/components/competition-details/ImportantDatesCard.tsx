import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card } from '../common/Card';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { formatEventDate } from '../../utils/formatters';

interface ImportantDatesCardProps {
  dates: {
    registrationEnd: string | Date;
    submissionStart: string | Date;
    submissionEnd: string | Date;
    resultDate: string | Date;
  };
}

export const ImportantDatesCard: React.FC<ImportantDatesCardProps> = ({ dates }) => {
  const { t } = useTranslation();

  const regEnd = formatEventDate(dates.registrationEnd);
  const subStart = formatEventDate(dates.submissionStart);
  const subEnd = formatEventDate(dates.submissionEnd);
  const resDate = formatEventDate(dates.resultDate);

  return (
    <Card padding="lg" style={styles.card}>
      <Text style={styles.sectionHeader}>Important Dates</Text>

      <View style={styles.gridContainer}>
        {/* Horizontal Divider Line */}
        <View style={styles.horizontalDivider} />
        {/* Vertical Divider Line */}
        <View style={styles.verticalDivider} />

        {/* Top-Left: Register Before */}
        <View style={[styles.cell, styles.topLeftCell]}>
          <View style={styles.iconWrapper}>
            <Feather name="calendar" size={18} color={colors.primary} />
          </View>
          <View style={styles.cellContent}>
            <Text style={styles.cellLabel}>{t('registerBefore')}</Text>
            <Text style={styles.cellDate}>{regEnd.date}</Text>
            <Text style={styles.cellTime}>{regEnd.time}</Text>
          </View>
        </View>

        {/* Top-Right: Submission Starts */}
        <View style={[styles.cell, styles.topRightCell]}>
          <View style={styles.iconWrapper}>
            <Feather name="send" size={18} color={colors.primary} />
          </View>
          <View style={styles.cellContent}>
            <Text style={styles.cellLabel}>{t('submissionStarts')}</Text>
            <Text style={styles.cellDate}>{subStart.date}</Text>
            <Text style={styles.cellTime}>{subStart.time}</Text>
          </View>
        </View>

        {/* Bottom-Left: Submission Ends */}
        <View style={[styles.cell, styles.bottomLeftCell]}>
          <View style={styles.iconWrapper}>
            <Feather name="upload" size={18} color={colors.primary} />
          </View>
          <View style={styles.cellContent}>
            <Text style={styles.cellLabel}>{t('submissionEnds')}</Text>
            <Text style={styles.cellDate}>{subEnd.date}</Text>
            <Text style={styles.cellTime}>{subEnd.time}</Text>
          </View>
        </View>

        {/* Bottom-Right: Result Date */}
        <View style={[styles.cell, styles.bottomRightCell]}>
          <View style={styles.iconWrapper}>
            <Ionicons name="trophy-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.cellContent}>
            <Text style={styles.cellLabel}>{t('resultDate')}</Text>
            <Text style={styles.cellDate}>{resDate.date}</Text>
            <Text style={styles.cellTime}>{resDate.time}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    ...typography.h2,
    fontSize: 15,
    marginBottom: spacing.md,
  },
  gridContainer: {
    position: 'relative',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  horizontalDivider: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: colors.divider,
    zIndex: 1,
  },
  verticalDivider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 1,
    backgroundColor: colors.divider,
    zIndex: 1,
  },
  cell: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  topLeftCell: {
    paddingRight: spacing.sm,
    paddingBottom: spacing.lg,
  },
  topRightCell: {
    paddingLeft: spacing.md,
    paddingBottom: spacing.lg,
  },
  bottomLeftCell: {
    paddingRight: spacing.sm,
    paddingTop: spacing.lg,
  },
  bottomRightCell: {
    paddingLeft: spacing.md,
    paddingTop: spacing.lg,
  },
  iconWrapper: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  cellContent: {
    flex: 1,
  },
  cellLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  cellDate: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cellTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
});
