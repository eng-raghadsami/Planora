<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

class MarketDataService
{
    private const WORLD_BANK_INDICATORS = [
        'inflation_percent' => 'FP.CPI.TOTL.ZG',
        'gdp_growth_percent' => 'NY.GDP.MKTP.KD.ZG',
        'gdp_per_capita_usd' => 'NY.GDP.PCAP.CD',
    ];

    private const COUNTRY_META = [
        'Canada' => ['iso3' => 'CAN', 'currency' => 'CAD'],
        'Egypt' => ['iso3' => 'EGY', 'currency' => 'EGP'],
        'Germany' => ['iso3' => 'DEU', 'currency' => 'EUR'],
        'Jordan' => ['iso3' => 'JOR', 'currency' => 'JOD'],
        'Lebanon' => ['iso3' => 'LBN', 'currency' => 'LBP'],
        'Palestine' => ['iso3' => 'PSE', 'currency' => 'ILS'],
        'Saudi Arabia' => ['iso3' => 'SAU', 'currency' => 'SAR'],
        'Syria' => ['iso3' => 'SYR', 'currency' => 'SYP'],
        'United Arab Emirates' => ['iso3' => 'ARE', 'currency' => 'AED'],
        'United Kingdom' => ['iso3' => 'GBR', 'currency' => 'GBP'],
        'United States' => ['iso3' => 'USA', 'currency' => 'USD'],
    ];

    public function countrySignals(string $country): array
    {
        $meta = self::COUNTRY_META[$country] ?? null;

        if (! $meta) {
            return $this->emptySignals($country);
        }

        return Cache::remember(
            'market-data.country.' . md5($country),
            now()->addDay(),
            fn () => $this->fetchCountrySignals($country, $meta)
        );
    }

    public function sourceSummary(): array
    {
        return [
            'mode' => config('services.planora_data.live_enabled') ? 'live_with_fallback' : 'fallback_only',
            'sources' => [
                ['name' => 'World Bank Open Data', 'url' => 'https://api.worldbank.org/v2'],
                ['name' => 'Frankfurter Exchange Rates', 'url' => 'https://api.frankfurter.app'],
            ],
            'cache_ttl_hours' => 24,
        ];
    }

    private function fetchCountrySignals(string $country, array $meta): array
    {
        if (! config('services.planora_data.live_enabled')) {
            return $this->emptySignals($country, 'fallback_disabled');
        }

        $signals = $this->emptySignals($country);
        $signals['iso3'] = $meta['iso3'];
        $signals['currency'] = $meta['currency'];

        foreach (self::WORLD_BANK_INDICATORS as $key => $indicator) {
            $value = $this->worldBankLatestValue($meta['iso3'], $indicator);

            if ($value !== null) {
                $signals[$key] = $value;
            }
        }

        $exchangeRate = $this->usdExchangeRate($meta['currency']);

        if ($exchangeRate !== null) {
            $signals['usd_exchange_rate'] = $exchangeRate;
        }

        $signals['fetched_at'] = now()->toIso8601String();
        $signals['source_status'] = $this->hasAnyLiveValue($signals) ? 'live' : 'fallback';

        return $signals;
    }

    private function worldBankLatestValue(string $countryCode, string $indicator): ?float
    {
        try {
            $response = Http::timeout(4)
                ->retry(1, 200)
                ->get("https://api.worldbank.org/v2/country/{$countryCode}/indicator/{$indicator}", [
                    'format' => 'json',
                    'per_page' => 8,
                ]);

            if (! $response->ok()) {
                return null;
            }

            $rows = $response->json()[1] ?? [];

            foreach ($rows as $row) {
                if (isset($row['value']) && is_numeric($row['value'])) {
                    return round((float) $row['value'], 2);
                }
            }
        } catch (Throwable) {
            return null;
        }

        return null;
    }

    private function usdExchangeRate(string $currency): ?float
    {
        if ($currency === 'USD') {
            return 1.0;
        }

        try {
            $response = Http::timeout(4)
                ->retry(1, 200)
                ->get('https://api.frankfurter.app/latest', [
                    'from' => 'USD',
                    'to' => $currency,
                ]);

            if (! $response->ok()) {
                return null;
            }

            $rate = $response->json("rates.{$currency}");

            return is_numeric($rate) ? round((float) $rate, 4) : null;
        } catch (Throwable) {
            return null;
        }
    }

    private function hasAnyLiveValue(array $signals): bool
    {
        return $signals['inflation_percent'] !== null
            || $signals['gdp_growth_percent'] !== null
            || $signals['gdp_per_capita_usd'] !== null
            || $signals['usd_exchange_rate'] !== null;
    }

    private function emptySignals(string $country, string $status = 'fallback'): array
    {
        $meta = self::COUNTRY_META[$country] ?? ['iso3' => null, 'currency' => 'USD'];

        return [
            'country' => $country,
            'iso3' => $meta['iso3'],
            'currency' => $meta['currency'],
            'inflation_percent' => null,
            'gdp_growth_percent' => null,
            'gdp_per_capita_usd' => null,
            'usd_exchange_rate' => $meta['currency'] === 'USD' ? 1.0 : null,
            'source_status' => $status,
            'fetched_at' => null,
        ];
    }
}
