import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCreateCompetition } from '../../../src/hooks/useCompetition';
import { colors, radius, spacing, typography } from '../../../src/constants/theme';
import { formatCurrency } from '../../../src/utils/formatters';

const PRESET_COVERS = [
  { label: 'Kathak', url: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&q=80' },
  { label: 'Bharatanatyam', url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&q=80' },
  { label: 'Classical Music', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80' },
  { label: 'Folk Dance', url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80' },
];

const CATEGORIES = ['Dance', 'Music', 'Folk', 'Instrumental'];

export default function CreateCompetitionScreen() {
  const router = useRouter();
  const createMutation = useCreateCompetition();

  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Dance');
  const [coverImageUrl, setCoverImageUrl] = useState(PRESET_COVERS[0].url);
  const [prizePool, setPrizePool] = useState('1500');
  const [entryFee, setEntryFee] = useState('99');
  const [totalSpots, setTotalSpots] = useState('20');
  const [isMultiWin, setIsMultiWin] = useState(true);
  const [winnersGetCertificate, setWinnersGetCertificate] = useState(true);

  // Schedule (Defaults to future dates)
  const now = new Date();
  const [regEndDays, setRegEndDays] = useState(3);
  const [subEndDays, setSubEndDays] = useState(10);
  const [resultDays, setResultDays] = useState(15);

  // Judge info
  const [judgeName, setJudgeName] = useState('');
  const [judgeTitle, setJudgeTitle] = useState('Senior Classical Guru');
  const [judgeExp, setJudgeExp] = useState('12');
  const [judgePhoto, setJudgePhoto] = useState('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80');

  // Descriptions
  const [description, setDescription] = useState(
    'National level solo classical battle open to all performers. Showcase your talent and get judged by master artists.'
  );

  // Judging parameters
  const [parameters, setParameters] = useState<string[]>([
    'Rhythm (Taal) & Footwork precision',
    'Expressions (Abhinaya) & Facial Grace',
    'Posture (Anga Shuddhi)',
    'Choreography & Presentation',
  ]);
  const [newParam, setNewParam] = useState('');

  // Rules
  const [rules, setRules] = useState<string[]>([
    'Solo performances only (2 to 5 minutes)',
    'Unedited, single-take video recording required',
    'Open to all age groups across India & globally',
  ]);
  const [newRule, setNewRule] = useState('');

  // Rewards list
  const [rewards, setRewards] = useState([
    { position: 1, label: '1st Winner', amount: 800 },
    { position: 2, label: '2nd Winner', amount: 450 },
    { position: 3, label: '3rd Winner', amount: 250 },
  ]);

  // Apply quick schedule preset
  const applyPresetSchedule = (daysReg: number, daysSub: number, daysRes: number) => {
    setRegEndDays(daysReg);
    setSubEndDays(daysSub);
    setResultDays(daysRes);
  };

  // Auto-calculate rewards distribution based on current prize pool
  const autoDistributeRewards = () => {
    const total = parseFloat(prizePool) || 1000;
    const first = Math.round(total * 0.5);
    const second = Math.round(total * 0.3);
    const third = Math.max(0, total - first - second);

    setRewards([
      { position: 1, label: '1st Winner', amount: first },
      { position: 2, label: '2nd Winner', amount: second },
      { position: 3, label: '3rd Winner', amount: third },
    ]);
  };

  const handleAddParam = () => {
    if (newParam.trim()) {
      setParameters([...parameters, newParam.trim()]);
      setNewParam('');
    }
  };

  const handleRemoveParam = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const handleAddRule = () => {
    if (newRule.trim()) {
      setRules([...rules, newRule.trim()]);
      setNewRule('');
    }
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || title.length < 4) {
      Alert.alert('Validation Error', 'Please enter a valid competition title (at least 4 characters).');
      return;
    }
    if (!judgeName.trim()) {
      Alert.alert('Validation Error', 'Please enter the Judge Name.');
      return;
    }

    const regEnd = new Date(Date.now() + regEndDays * 24 * 3600 * 1000);
    const subStart = new Date(Date.now());
    const subEnd = new Date(Date.now() + subEndDays * 24 * 3600 * 1000);
    const resDate = new Date(Date.now() + resultDays * 24 * 3600 * 1000);

    const payload = {
      title: title.trim(),
      category,
      tags: [category, isMultiWin ? 'Multi-Win' : 'Single-Win'],
      isMultiWin,
      winnersGetCertificate,
      coverImageUrl,
      prizePool: parseFloat(prizePool) || 0,
      entryFee: parseFloat(entryFee) || 0,
      currency: 'INR',
      totalSpots: parseInt(totalSpots, 10) || 20,
      dates: {
        registrationStart: new Date(),
        registrationEnd: regEnd.toISOString(),
        submissionStart: subStart.toISOString(),
        submissionEnd: subEnd.toISOString(),
        resultDate: resDate.toISOString(),
      },
      judge: {
        name: judgeName.trim(),
        title: judgeTitle.trim() || 'Classical Guru',
        experienceYears: parseInt(judgeExp, 10) || 8,
        photoUrl: judgePhoto,
        introVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      },
      description: description.trim(),
      descriptionFull: description.trim(),
      judgingParameters: parameters,
      rulesAndEligibility: rules,
      rewards,
      disclaimer: 'Disclaimer: Only contributions from paid participants will be considered for judging.',
    };

    try {
      const created = await createMutation.mutateAsync(payload);
      Alert.alert('🎉 Battle Created!', 'Your competition is now live on Feedants.', [
        {
          text: 'View Competition',
          onPress: () => router.push(`/(app)/competitions/${created.slug || created.id}`),
        },
      ]);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to create competition.';
      Alert.alert('Error', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Header Bar */}
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.screenTitle}>Host a Battle</Text>
          <Text style={styles.screenSubtitle}>Create a classical talent competition</Text>
        </View>

        {/* Edit / Preview Segmented Pill */}
        <View style={styles.segmentPill}>
          <TouchableOpacity
            style={[styles.segmentBtn, mode === 'edit' && styles.segmentBtnActive]}
            onPress={() => setMode('edit')}
          >
            <Text style={[styles.segmentBtnText, mode === 'edit' && styles.segmentBtnTextActive]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, mode === 'preview' && styles.segmentBtnActive]}
            onPress={() => setMode('preview')}
          >
            <Text style={[styles.segmentBtnText, mode === 'preview' && styles.segmentBtnTextActive]}>Preview</Text>
          </TouchableOpacity>
        </View>
      </View>

      {mode === 'preview' ? (
        /* LIVE PREVIEW MODE */
        <ScrollView style={styles.formScroll} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.previewNotice}>Live Card Preview (How participants see it)</Text>
          <View style={styles.previewCard}>
            <Image source={{ uri: coverImageUrl }} style={styles.previewCover} />
            <View style={styles.previewBadgeRow}>
              <View style={styles.previewCatBadge}>
                <Text style={styles.previewCatBadgeText}>{category}</Text>
              </View>
              {isMultiWin && (
                <View style={styles.previewMultiBadge}>
                  <Text style={styles.previewMultiBadgeText}>Multi-Win</Text>
                </View>
              )}
            </View>

            <View style={styles.previewBody}>
              <Text style={styles.previewTitle}>{title || 'Your Competition Title'}</Text>
              <Text style={styles.previewJudge}>
                Judge: {judgeName || 'Judge Name'} • {judgeTitle}
              </Text>
              <Text style={styles.previewDesc}>{description}</Text>

              <View style={styles.previewStatsRow}>
                <View>
                  <Text style={styles.previewStatLabel}>Prize Pool</Text>
                  <Text style={styles.previewStatVal}>{formatCurrency(parseFloat(prizePool) || 0)}</Text>
                </View>
                <View>
                  <Text style={styles.previewStatLabel}>Entry Fee</Text>
                  <Text style={styles.previewStatVal}>{formatCurrency(parseFloat(entryFee) || 0)}</Text>
                </View>
                <View>
                  <Text style={styles.previewStatLabel}>Capacity</Text>
                  <Text style={styles.previewStatVal}>{totalSpots || 20} spots</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.switchBackButton} onPress={() => setMode('edit')}>
            <Feather name="edit-2" size={16} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.switchBackText}>Back to Edit Form</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        /* EDIT FORM MODE */
        <ScrollView style={styles.formScroll} contentContainerStyle={styles.scrollContent}>
          {/* Section 1: Basic Info */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>1. Basic Information</Text>

            <Text style={styles.inputLabel}>Competition Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Feedants Kathak Solo Championship"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.inputLabel}>Art Form / Category *</Text>
            <View style={styles.categoryPillRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catOption, category === cat && styles.catOptionActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catOptionText, category === cat && styles.catOptionTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Cover Image</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetCoversScroll}>
              {PRESET_COVERS.map((preset, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.presetCoverCard, coverImageUrl === preset.url && styles.presetCoverCardActive]}
                  onPress={() => setCoverImageUrl(preset.url)}
                >
                  <Image source={{ uri: preset.url }} style={styles.presetThumb} />
                  <Text style={styles.presetLabel}>{preset.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Section 2: Capacity & Financials */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>2. Capacity & Pricing</Text>

            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>Total Spots</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={totalSpots}
                  onChangeText={setTotalSpots}
                />
              </View>

              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>Entry Fee (₹)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={entryFee}
                  onChangeText={setEntryFee}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Prize Pool (₹)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={prizePool}
                  onChangeText={setPrizePool}
                />
              </View>
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.switchLabel}>Multi-Tier Rewards</Text>
                <Text style={styles.switchDesc}>Reward 1st, 2nd, and 3rd place winners</Text>
              </View>
              <Switch value={isMultiWin} onValueChange={setIsMultiWin} trackColor={{ true: colors.primary, false: '#E2E8F0' }} />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.switchLabel}>Verifiable Certificates</Text>
                <Text style={styles.switchDesc}>Winners and participants receive certificates</Text>
              </View>
              <Switch value={winnersGetCertificate} onValueChange={setWinnersGetCertificate} trackColor={{ true: colors.primary, false: '#E2E8F0' }} />
            </View>
          </View>

          {/* Section 3: Schedule & Timeline */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>3. Timeline Presets</Text>
            <Text style={styles.sectionHelp}>Select standard duration for registration and evaluation</Text>

            <View style={styles.presetButtonsRow}>
              <TouchableOpacity
                style={[styles.presetBtn, regEndDays === 3 && styles.presetBtnActive]}
                onPress={() => applyPresetSchedule(3, 8, 12)}
              >
                <Text style={[styles.presetBtnText, regEndDays === 3 && styles.presetBtnTextActive]}>Fast (3 Days)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetBtn, regEndDays === 7 && styles.presetBtnActive]}
                onPress={() => applyPresetSchedule(7, 14, 20)}
              >
                <Text style={[styles.presetBtnText, regEndDays === 7 && styles.presetBtnTextActive]}>Standard (1 Wk)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetBtn, regEndDays === 14 && styles.presetBtnActive]}
                onPress={() => applyPresetSchedule(14, 25, 30)}
              >
                <Text style={[styles.presetBtnText, regEndDays === 14 && styles.presetBtnTextActive]}>Grand (2 Wks)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timelineSummary}>
              <Text style={styles.timelineSummaryItem}>• Registration closes in: <Text style={{ fontWeight: '700' }}>{regEndDays} days</Text></Text>
              <Text style={styles.timelineSummaryItem}>• Submissions deadline: <Text style={{ fontWeight: '700' }}>{subEndDays} days</Text></Text>
              <Text style={styles.timelineSummaryItem}>• Results announcement: <Text style={{ fontWeight: '700' }}>{resultDays} days</Text></Text>
            </View>
          </View>

          {/* Section 4: Judge Profile */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>4. Judge & Evaluator</Text>

            <Text style={styles.inputLabel}>Judge Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Guru Padmaja Suresh"
              placeholderTextColor={colors.textSecondary}
              value={judgeName}
              onChangeText={setJudgeName}
            />

            <View style={styles.rowInputs}>
              <View style={{ flex: 2, marginRight: 8 }}>
                <Text style={styles.inputLabel}>Title / Designation</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Senior Kathak Exponent"
                  placeholderTextColor={colors.textSecondary}
                  value={judgeTitle}
                  onChangeText={setJudgeTitle}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Experience (Yrs)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={judgeExp}
                  onChangeText={setJudgeExp}
                />
              </View>
            </View>
          </View>

          {/* Section 5: Description & Parameters */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>5. Judging Criteria & Rules</Text>

            <Text style={styles.inputLabel}>Short Description</Text>
            <TextInput
              style={[styles.textInput, { height: 70, textAlignVertical: 'top' }]}
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Judging Parameters</Text>
            {parameters.map((param, index) => (
              <View key={index} style={styles.listItemRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.listItemText}>{param}</Text>
                <TouchableOpacity onPress={() => handleRemoveParam(index)}>
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.addItemInputRow}>
              <TextInput
                style={[styles.textInput, { flex: 1, marginRight: 8 }]}
                placeholder="Add criteria (e.g. Eye expressions)"
                placeholderTextColor={colors.textSecondary}
                value={newParam}
                onChangeText={setNewParam}
              />
              <TouchableOpacity style={styles.addSmallBtn} onPress={handleAddParam}>
                <Text style={styles.addSmallBtnText}>Add</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Rules & Eligibility</Text>
            {rules.map((rule, index) => (
              <View key={index} style={styles.listItemRow}>
                <Ionicons name="shield-checkmark" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.listItemText}>{rule}</Text>
                <TouchableOpacity onPress={() => handleRemoveRule(index)}>
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.addItemInputRow}>
              <TextInput
                style={[styles.textInput, { flex: 1, marginRight: 8 }]}
                placeholder="Add rule (e.g. Duration 2-5 mins)"
                placeholderTextColor={colors.textSecondary}
                value={newRule}
                onChangeText={setNewRule}
              />
              <TouchableOpacity style={styles.addSmallBtn} onPress={handleAddRule}>
                <Text style={styles.addSmallBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section 6: Rewards Breakdown */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>6. Winner Rewards Breakdown</Text>
              <TouchableOpacity onPress={autoDistributeRewards}>
                <Text style={styles.autoCalcText}>Auto-Distribute</Text>
              </TouchableOpacity>
            </View>

            {rewards.map((r, i) => (
              <View key={i} style={styles.rewardTierRow}>
                <View style={styles.rankCircle}>
                  <Text style={styles.rankCircleText}>#{r.position}</Text>
                </View>
                <Text style={styles.rewardLabelText}>{r.label}</Text>
                <Text style={styles.rewardAmountText}>{formatCurrency(r.amount)}</Text>
              </View>
            ))}
          </View>

          {/* Submit Action Button */}
          <TouchableOpacity
            style={styles.publishButton}
            onPress={handleSubmit}
            disabled={createMutation.isPending}
            activeOpacity={0.88}
          >
            {createMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="rocket-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.publishButtonText}>Publish Competition Live</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F0',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  screenSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  segmentPill: {
    flexDirection: 'row',
    backgroundColor: '#EEF4F2',
    borderRadius: radius.pill,
    padding: 3,
  },
  segmentBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentBtnTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  formScroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 1.5,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2EBE8',
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionHelp: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  autoCalcText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#FAFCFB',
    borderWidth: 1,
    borderColor: '#D4E2DE',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.textPrimary,
  },
  categoryPillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.sm,
  },
  catOption: {
    flex: 1,
    backgroundColor: '#F0F5F3',
    paddingVertical: 8,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  catOptionActive: {
    backgroundColor: colors.primary,
  },
  catOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  catOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  presetCoversScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  presetCoverCard: {
    width: 80,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginRight: 8,
  },
  presetCoverCardActive: {
    borderColor: colors.primary,
  },
  presetThumb: {
    width: 80,
    height: 50,
    borderRadius: radius.sm,
  },
  presetLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F2',
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  switchDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  presetButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.sm,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: '#F0F5F3',
    paddingVertical: 8,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  presetBtnActive: {
    backgroundColor: colors.primary,
  },
  presetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  presetBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  timelineSummary: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timelineSummaryItem: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F2',
  },
  listItemText: {
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
  addItemInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addSmallBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.sm,
  },
  addSmallBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  rewardTierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F2',
  },
  rankCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  rankCircleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  rewardLabelText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  rewardAmountText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  publishButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radius.md,
    marginTop: spacing.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  previewNotice: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2EBE8',
  },
  previewCover: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  previewBadgeRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 6,
  },
  previewCatBadge: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  previewCatBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  previewMultiBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  previewMultiBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  previewBody: {
    padding: spacing.md,
  },
  previewTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  previewJudge: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  previewDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  previewStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9F7',
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  previewStatLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  previewStatVal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  switchBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: spacing.md,
  },
  switchBackText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
