import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { DiscordUser } from '@/types/user';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    const baseUrl = process.env.NEXTAUTH_URL || request.url;
    return NextResponse.redirect('https://casino-production-cdf7.up.railway.app/dashboard');
  }

  try {
    // 1. Échanger le code contre un access token
    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI!,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // 2. Récupérer les infos de l'utilisateur Discord
    const userResponse = await axios.get<DiscordUser>(
      'https://discord.com/api/users/@me',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const discordUser = userResponse.data;

    // 3. Chercher ou créer l'utilisateur dans la BDD
    let user = await prisma.user.findUnique({
      where: { discordId: discordUser.id },
      include: {
        casinoStats: true,
      },
    });

    if (!user) {
      // Créer un nouvel utilisateur
      user = await prisma.user.create({
        data: {
          discordId: discordUser.id,
          username: discordUser.username,
          credits: BigInt(1000), // Crédits de départ
        },
        include: {
          casinoStats: true,
        },
      });

      // Créer les stats casino
      await prisma.casinoStats.create({
        data: {
          userId: user.id,
        },
      });
    }

    // 4. Créer un JWT token pour le site
    const jwtToken = jwt.sign(
      {
        userId: user.id,
        discordId: user.discordId,
        username: user.username,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // 5. Rediriger vers le dashboard avec le token
    const response = NextResponse.redirect(
      new URL('/dashboard', request.url)
    );

    // Stocker le token dans un cookie sécurisé
    response.cookies.set('auth_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });

    return response;
  } catch (error) {
    console.error('Erreur OAuth Discord:', error);
    return NextResponse.redirect(
      new URL('/?error=auth_failed', request.url)
    );
  }

}

