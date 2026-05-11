import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import * as admin from 'firebase-admin';

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Initialize Firebase Admin
if (!admin.apps.length && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle escaped newlines in the private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export async function GET(req: Request) {
  // Disable cron auth temporarily for testing or if you use CRON_SECRET, enable it.
  /*
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  */

  if (!redis) {
    return NextResponse.json({ error: 'Redis is not configured' }, { status: 500 });
  }

  try {
    const now = Date.now();
    
    // Find alarms that are due (score <= now)
    const dueAlarms = await redis.zrange('alarms', 0, now, { byScore: true });

    if (dueAlarms.length === 0) {
      return NextResponse.json({ success: true, message: 'No alarms due' });
    }

    // Process each alarm
    for (const alarmStr of dueAlarms) {
      // In @upstash/redis, string members might be returned as objects if it parses JSON automatically, 
      // or as strings. We handle both.
      const alarm = typeof alarmStr === 'string' ? JSON.parse(alarmStr) : alarmStr;
      
      try {
        if (admin.apps.length > 0) {
          await admin.messaging().send({
            token: alarm.token,
            notification: {
              title: alarm.title || "🚆 WakeTrain",
              body: alarm.body || "まもなく到着します！",
            },
            data: {
              action: "open_app"
            },
            android: {
              priority: 'high',
              notification: {
                channelId: 'train-alarm-channel',
                sound: 'default'
              }
            },
            apns: {
              payload: {
                aps: {
                  sound: 'default',
                  badge: 1,
                  contentAvailable: true,
                }
              }
            }
          });
          console.log(`Notification sent to ${alarm.token}`);
        }
      } catch (err) {
        console.error('Failed to send FCM message:', err);
      }

      // Remove from Redis after processing
      await redis.zrem('alarms', typeof alarmStr === 'string' ? alarmStr : JSON.stringify(alarmStr));
    }

    return NextResponse.json({ success: true, processed: dueAlarms.length });
  } catch (error: any) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
