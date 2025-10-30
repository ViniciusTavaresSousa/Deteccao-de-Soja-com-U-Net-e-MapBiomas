<div align="center">

# Detecção de Soja com U-Net e MapBiomas

----------

[![python](https://img.shields.io/badge/python-3.12.12-green)]()
[![tensorflow](https://img.shields.io/badge/tensorflow-2.19.0-orange)]()

----------

<div align="left">

## Introdução

Este projeto apresenta o desenvolvimento de uma U-Net 3D aplicada à detecção e segmentação de áreas de soja a partir de imagens multiespectrais de satélite. O modelo é treinado de forma supervisionada utilizando dados do MapBiomas, explorando a variação temporal das bandas espectrais para identificar padrões relacionados ao cultivo da soja.
A arquitetura proposta utiliza blocos convolucionais 3D para capturar tanto informações espaciais quanto temporais, e é treinada com uma função de perda combinada (BCE + Dice Loss balanceada), que busca otimizar a precisão de segmentação mesmo em cenários com forte desbalanceamento entre classes.
