import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Fade,
} from '@mui/material';
import { TrendingUp, Calendar, Briefcase } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { el } from 'date-fns/locale';
import Layout from '../components/Layout';
import { getAppointments, getServices } from '../services/authService';

const PERIODS = [
  { value: 'day', label: 'Ημέρα' },
  { value: 'week', label: 'Εβδομάδα' },
  { value: 'month', label: 'Μήνας' },
  { value: 'year', label: 'Έτος' },
];

function parseApptDate(startTime) {
  const s = String(startTime || '').trim();
  if (!s) return new Date(NaN);
  const iso = s.includes('T') ? s : s.replace(' ', 'T');
  const parsed = new Date(iso);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  const datePart = s.split(' ')[0];
  const [y, m, d] = datePart.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function getBucket(date, period) {
  switch (period) {
    case 'day':
      return {
        sortKey: format(date, 'yyyy-MM-dd'),
        label: format(date, 'dd/MM/yyyy', { locale: el }),
      };
    case 'week': {
      const start = startOfWeek(date, { weekStartsOn: 1 });
      const end = endOfWeek(date, { weekStartsOn: 1 });
      return {
        sortKey: format(start, 'yyyy-MM-dd'),
        label: `${format(start, 'dd/MM', { locale: el })} – ${format(end, 'dd/MM/yyyy', { locale: el })}`,
      };
    }
    case 'month':
      return {
        sortKey: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM yyyy', { locale: el }),
      };
    case 'year':
      return {
        sortKey: format(date, 'yyyy'),
        label: format(date, 'yyyy'),
      };
    default:
      return { sortKey: '', label: '' };
  }
}

function buildServiceMap(services) {
  const map = new Map();
  (services || []).forEach((s) => {
    map.set(String(s.id), {
      name: s.name,
      price: Number(s.price) || 0,
    });
  });
  return map;
}

function activeAppointments(appointments) {
  return (appointments || []).filter((a) => a.status !== 'cancelled');
}

function formatEuro(amount) {
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

const RevenueBarChart = ({ data, maxRevenue }) => {
  if (!data.length) {
    return (
      <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        Δεν υπάρχουν δεδομένα για την επιλεγμένη περίοδο.
      </Typography>
    );
  }

  const max = maxRevenue || Math.max(...data.map((d) => d.revenue), 1);

  const listTotal = data.reduce((s, r) => s + r.revenue, 0);
  const listCount = data.reduce((s, r) => s + r.count, 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
      <Box
        sx={{
          maxHeight: 360,
          overflowY: 'auto',
          pr: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
      {data.map((row) => (
        <Box key={row.sortKey}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'minmax(120px, 1fr) auto auto' },
              gap: { xs: 0.5, sm: 2 },
              alignItems: 'center',
              mb: 0.75,
            }}
          >
            <Typography variant="body2" fontWeight={600} color="#374151">
              {row.label}
            </Typography>
            <Typography
              variant="body2"
              fontWeight={700}
              color="#059669"
              sx={{ textAlign: { sm: 'right' }, whiteSpace: 'nowrap' }}
            >
              {formatEuro(row.revenue)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textAlign: { sm: 'right' }, whiteSpace: 'nowrap' }}
            >
              {row.count} {row.count === 1 ? 'κράτηση' : 'κρατήσεις'}
            </Typography>
          </Box>
          <Box
            sx={{
              height: 10,
              borderRadius: '6px',
              bgcolor: '#e5e7eb',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${Math.max((row.revenue / max) * 100, row.revenue > 0 ? 4 : 0)}%`,
                borderRadius: '6px',
                background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                transition: 'width 400ms ease',
              }}
            />
          </Box>
        </Box>
      ))}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ pt: 1, borderTop: '1px solid #e5e7eb' }}>
        Άθροισμα λίστας: {formatEuro(listTotal)} · {listCount} κρατήσεις
      </Typography>
    </Box>
  );
};

export default function Statistics() {
  const [period, setPeriod] = useState('month');
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [apptRes, svcRes] = await Promise.all([
          getAppointments(),
          getServices(),
        ]);
        setAppointments(Array.isArray(apptRes.data) ? apptRes.data : []);
        const svcData = svcRes?.data;
        setServices(Array.isArray(svcData) ? svcData : svcData?.services || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const serviceMap = useMemo(() => buildServiceMap(services), [services]);

  const revenueByPeriod = useMemo(() => {
    const buckets = {};
    activeAppointments(appointments).forEach((a) => {
      const date = parseApptDate(a.start_time);
      if (Number.isNaN(date.getTime())) return;
      const price = serviceMap.get(String(a.service_id))?.price ?? 0;
      const { sortKey, label } = getBucket(date, period);
      if (!buckets[sortKey]) {
        buckets[sortKey] = { sortKey, label, revenue: 0, count: 0 };
      }
      buckets[sortKey].revenue += price;
      buckets[sortKey].count += 1;
    });
    return Object.values(buckets).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [appointments, serviceMap, period]);

  const revenueByService = useMemo(() => {
    const buckets = {};
    activeAppointments(appointments).forEach((a) => {
      const sid = String(a.service_id);
      const svc = serviceMap.get(sid);
      const name = svc?.name || a.service_name || 'Άγνωστη υπηρεσία';
      const price = svc?.price ?? 0;
      if (!buckets[sid]) {
        buckets[sid] = { id: sid, name, revenue: 0, count: 0 };
      }
      buckets[sid].revenue += price;
      buckets[sid].count += 1;
    });
    return Object.values(buckets).sort((a, b) => b.revenue - a.revenue);
  }, [appointments, serviceMap]);

  const totalRevenue = useMemo(
    () =>
      activeAppointments(appointments).reduce((sum, a) => {
        return sum + (serviceMap.get(String(a.service_id))?.price ?? 0);
      }, 0),
    [appointments, serviceMap]
  );

  const totalBookings = useMemo(
    () => activeAppointments(appointments).length,
    [appointments]
  );

  const periodBucketCount = revenueByPeriod.length;

  const todayStats = useMemo(() => {
    if (period !== 'day') return null;
    const todayKey = format(new Date(), 'yyyy-MM-dd');
    const row = revenueByPeriod.find((r) => r.sortKey === todayKey);
    return {
      label: format(new Date(), 'dd/MM/yyyy', { locale: el }),
      revenue: row?.revenue ?? 0,
      count: row?.count ?? 0,
    };
  }, [revenueByPeriod, period]);

  const periodUnitLabel = {
    day: 'ημέρες',
    week: 'εβδομάδες',
    month: 'μήνες',
    year: 'έτη',
  }[period];

  const maxServiceRevenue = useMemo(
    () => Math.max(...revenueByService.map((s) => s.revenue), 0),
    [revenueByService]
  );

  return (
    <Layout>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #f0f9ff 100%)',
          p: { xs: 2, md: 3 },
        }}
      >
        <Fade in timeout={300}>
          <Box
            sx={{
              mb: 4,
              p: 3,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <TrendingUp size={24} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800} color="#1e40af">
                  Στατιστικά
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Έσοδα από κρατήσεις (εξαιρούνται οι ακυρωμένες)
                </Typography>
              </Box>
            </Box>

            <ToggleButtonGroup
              value={period}
              exclusive
              onChange={(_, v) => v && setPeriod(v)}
              sx={{
                flexWrap: 'wrap',
                gap: 1,
                '& .MuiToggleButton-root': {
                  borderRadius: '10px !important',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2,
                  border: '1px solid #e5e7eb !important',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                  },
                },
              }}
            >
              {PERIODS.map((p) => (
                <ToggleButton key={p.value} value={p.value}>
                  {p.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        </Fade>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={period === 'day' ? 4 : 6}>
                <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Calendar size={20} color="#3b82f6" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Συνολικά έσοδα
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight={800} color="#059669">
                      {formatEuro(totalRevenue)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      από {totalBookings} κρατήσεις
                      {periodBucketCount > 0 && (
                        <> · {periodBucketCount} {periodUnitLabel} με έσοδα</>
                      )}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      (όχι μόνο σήμερα — όλες οι ενεργές κρατήσεις)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              {period === 'day' && (
                <Grid item xs={12} sm={4}>
                  <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Έσοδα σήμερα
                      </Typography>
                      <Typography variant="h4" fontWeight={800} color="#1e40af">
                        {formatEuro(todayStats?.revenue ?? 0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {todayStats?.label} · {todayStats?.count ?? 0}{' '}
                        {(todayStats?.count ?? 0) === 1 ? 'κράτηση' : 'κρατήσεις'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              <Grid item xs={12} sm={period === 'day' ? 4 : 6}>
                <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Briefcase size={20} color="#8b5cf6" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Συνολικές κρατήσεις
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight={800} color="#1e40af">
                      {totalBookings}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} lg={7}>
                <Fade in key={period} timeout={400}>
                  <Card
                    sx={{
                      borderRadius: '16px',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      height: '100%',
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={700} color="#1e40af" gutterBottom>
                        Έσοδα ανά {PERIODS.find((p) => p.value === period)?.label.toLowerCase()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Κάθε γραμμή = μία {PERIODS.find((p) => p.value === period)?.label.toLowerCase()} με κρατήσεις
                      </Typography>
                      <RevenueBarChart
                        data={revenueByPeriod}
                        maxRevenue={Math.max(...revenueByPeriod.map((d) => d.revenue), 0)}
                      />
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>

              <Grid item xs={12} lg={5}>
                <Card
                  sx={{
                    borderRadius: '16px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    height: '100%',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} color="#1e40af" gutterBottom>
                      Έσοδα ανά υπηρεσία
                    </Typography>
                    {revenueByService.length === 0 ? (
                      <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                        Δεν υπάρχουν κρατήσεις με έσοδα.
                      </Typography>
                    ) : (
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Υπηρεσία</TableCell>
                            <TableCell align="right">Κρατήσεις</TableCell>
                            <TableCell align="right">Έσοδα</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {revenueByService.map((row, index) => (
                            <TableRow key={row.id}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {index === 0 && (
                                    <Chip label="Top" size="small" color="primary" sx={{ fontWeight: 700 }} />
                                  )}
                                  <Typography fontWeight={index === 0 ? 700 : 500}>
                                    {row.name}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    mt: 0.75,
                                    height: 6,
                                    borderRadius: 4,
                                    bgcolor: '#e5e7eb',
                                    overflow: 'hidden',
                                  }}
                                >
                                  <Box
                                    sx={{
                                      height: '100%',
                                      width: `${maxServiceRevenue ? (row.revenue / maxServiceRevenue) * 100 : 0}%`,
                                      bgcolor: index === 0 ? '#059669' : '#3b82f6',
                                      borderRadius: 4,
                                    }}
                                  />
                                </Box>
                              </TableCell>
                              <TableCell align="right">{row.count}</TableCell>
                              <TableCell align="right">
                                <Typography fontWeight={700} color="#059669">
                                  {formatEuro(row.revenue)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Layout>
  );
}
