import React, {useEffect, useMemo, useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';

import {
  BarcodeDataUrl,
  BarcodeRenderService,
} from '../../../services/barcode/BarcodeRenderService';
import {fonts} from '../../../theme/tokens';
import {frameTemplateLabels, QRDesignConfig} from '../qrDesignTypes';

type QRDesignPreviewProps = {
  config: QRDesignConfig;
  content: string;
};

const codeSize = 220;

export function QRDesignPreview({config, content}: QRDesignPreviewProps) {
  const [preview, setPreview] = useState<BarcodeDataUrl | undefined>();
  const backgroundColor = config.backgroundTransparent
    ? 'transparent'
    : config.backgroundColor;
  const foregroundColor =
    config.colorMode === 'solid'
      ? config.foregroundColor
      : config.gradientEndColor;
  const frameText =
    config.frameTemplate === 'custom'
      ? config.frameText
      : frameTemplateLabels[config.frameTemplate];

  useEffect(() => {
    let isMounted = true;

    setPreview(undefined);
    BarcodeRenderService.createDataUrl({
      backgroundColor: config.backgroundTransparent
        ? '#FFFFFF'
        : config.backgroundColor,
      content,
      foregroundColor,
      format: 'qr-code',
      includeText: false,
      padding: 4,
      scale: 10,
      type: 'qr',
    })
      .then(result => {
        if (isMounted) {
          setPreview(result);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPreview(undefined);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    config.backgroundColor,
    config.backgroundTransparent,
    content,
    foregroundColor,
  ]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          alignItems: 'center',
          backgroundColor,
          borderColor: foregroundColor,
          borderRadius: 10,
          borderWidth: config.frameTemplate === 'none' ? 0 : 3,
          gap: 10,
          padding: config.frameTemplate === 'none' ? 12 : 16,
        },
        code: {
          alignItems: 'center',
          height: codeSize,
          justifyContent: 'center',
          overflow: 'hidden',
          width: codeSize,
        },
        codeArt: {
          height: codeSize,
          maxHeight: codeSize,
          maxWidth: codeSize,
          width: codeSize,
        },
        logo: {
          alignItems: 'center',
          backgroundColor: config.logoBackgroundColor,
          borderRadius: logoRadius(config),
          height: config.logoSize * 2,
          justifyContent: 'center',
          padding: config.logoPadding,
          position: 'absolute',
          width: config.logoSize * 2,
        },
        logoText: {
          color: foregroundColor,
          fontFamily: fonts.gb,
          fontSize: Math.max(12, config.logoSize),
        },
        logoImage: {
          borderRadius: logoRadius(config),
          height: '100%',
          width: '100%',
        },
        frameText: {
          color: foregroundColor,
          fontFamily: fonts.gb,
          fontSize: 15,
          letterSpacing: 0,
        },
      }),
    [backgroundColor, config, foregroundColor],
  );

  return (
    <View accessibilityLabel="Styled QR preview" style={styles.root}>
      {config.frameTemplate !== 'none' ? (
        <Text style={styles.frameText}>{frameText}</Text>
      ) : null}
      <View style={styles.code}>
        {preview ? (
          <Image
            resizeMode="contain"
            source={{uri: preview.uri}}
            style={[
              styles.codeArt,
              fitWithinSquare(preview.width, preview.height, codeSize),
            ]}
          />
        ) : (
          <Text style={styles.frameText}>QR preview unavailable</Text>
        )}
        {config.logoEnabled ? (
          <View style={styles.logo}>
            {config.logoUri ? (
              <Image
                resizeMode="cover"
                source={{uri: config.logoUri}}
                style={styles.logoImage}
              />
            ) : (
              <Text style={styles.logoText}>{config.logoIcon}</Text>
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function fitWithinSquare(width: number, height: number, size: number) {
  if (!width || !height) {
    return {height: size, width: size};
  }

  const scale = Math.min(size / width, size / height);
  return {
    height: Math.round(height * scale),
    width: Math.round(width * scale),
  };
}

function logoRadius(config: QRDesignConfig) {
  if (config.logoShape === 'circle') {
    return 999;
  }

  if (config.logoShape === 'rounded') {
    return config.logoBorderRadius;
  }

  return 0;
}
