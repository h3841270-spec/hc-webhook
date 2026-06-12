const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.post('/webhook', async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [req.body];
    for (const item of items) {
      await supabase.from('hc_webhook_data').upsert({
        data_type: item.dataType || item.type || 'unknown',
        recorded_at: item.startTime || item.time || new Date().toISOString(),
        value: item
      }, { onConflict: 'data_type,recorded_at' });
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000);
