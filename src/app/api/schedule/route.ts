import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Only instantiate Redis if URL is present (prevents build crash)
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, alarmTime, title, body: msgBody } = body;

    if (!token || !alarmTime) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (!redis) {
      return NextResponse.json({ error: 'Redis is not configured' }, { status: 500 });
    }

    // alarmTime is a timestamp (ms)
    // We store it as a sorted set with the score being the alarmTime
    const alarmId = `${token}_${alarmTime}`;
    const alarmData = {
      token,
      title,
      body: msgBody,
      alarmTime,
    };

    await redis.zadd('alarms', {
      score: alarmTime,
      member: JSON.stringify(alarmData),
    });

    return NextResponse.json({ success: true, message: 'Alarm scheduled' });
  } catch (error: any) {
    console.error('Error scheduling alarm:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
