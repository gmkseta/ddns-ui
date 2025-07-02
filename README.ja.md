# Cloudflare DDNS Web UI

Cloudflare DNS APIを使用した**セルフホスト型ダイナミックDNS管理Webインターフェース**

**🌍 Languages**: [English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)
![Docker Hub](https://img.shields.io/docker/v/gmkseta/ddns-ui?label=docker%20hub)

## 🚨 重要：セルフホスト型ソリューション

**これはセルフホスト型アプリケーションです**。お客様自身のサーバーまたはコンピューターで実行する必要があります。クラウドベースのDDNSサービスとは異なり、DNS管理システムの完全な制御と所有権を維持できます。

### 📍 インストール場所：
- **ホームサーバー**（NAS、Raspberry Piなど）
- **VPS/クラウドサーバー**（DigitalOcean、AWSなど）
- **ローカルコンピューター**（開発/テスト用）
- **Dockerが使用可能なデバイス**（どこでも）

## 🚀 従来のDDNSサービスと比較する理由

### 💸 人気サービスとの価格比較

| サービス | 価格 | ドメイン | 更新 | 制限事項 |
|---------|-------|--------|---------|-------------|
| **NoIP** | 無料/有料 | 限定ドメイン | 30日ごとに手動 | 機能制限 |
| **DynDNS** | $55/年 | 限定ドメイン | 自動 | 月額サブスクリプション |
| **Duck DNS** | 無料 | サブドメインのみ | 自動 | カスタムドメイン不可 |
| **AWS Route 53** | ~$15/年 | 独自ドメイン | 自動 | 複雑な設定、費用 |
| **🌟 このプロジェクト** | **無料** | **独自ドメイン** | **自動** | **制限なし** |

### ✨ クラウドサービスではなくセルフホストを選ぶ理由

#### 🔒 **完全なコントロール**
- **データは自分のもの**：DNSレコードへの第三者アクセスなし
- **ベンダーロックインなし**：インフラストラクチャの完全な制御
- **カスタム機能**：必要に応じて変更と拡張が可能

#### 💰 **大幅なコスト削減**
- **NoIP Premium**：$24.95/年 → **$0**
- **DynDNS**：$55/年 → **$0**
- **複数ドメイン**：ドメインごとの料金 vs. **無制限無料**

#### 🌐 **優れたパフォーマンス**
- **CloudflareのグローバルCDN**：99.9%アップタイム保証
- **無料SSL証明書**：自動HTTPS
- **DDoS保護**：エンタープライズグレードのセキュリティ
- **アナリティクス**：詳細なトラフィック分析

#### 🔧 **プロフェッショナル機能**
- **複数DNSプロバイダー**：Cloudflare（今後さらに追加予定）
- **Webインターフェース**：コマンドライン知識不要
- **自動更新**：設定後は放置可能
- **バックアップ/復元**：JSON形式でのエクスポート/インポート

## 🗺️ ロードマップ：マルチプロバイダーサポート

### 🎯 現在サポート中
- ✅ **Cloudflare DNS**（無料プラン：無制限ドメイン）

### 🚧 近日公開
- 🔄 **AWS Route 53**（クエリ課金制）
- 🔄 **DigitalOcean DNS**（Dropletで無料）
- 🔄 **Namecheap DNS**（ドメイン購入で無料）
- 🔄 **Google Cloud DNS**（クエリ課金制）
- 🔄 **Azure DNS**（クエリ課金制）

### 💡 複数プロバイダーの利点
- **選択と柔軟性**：好みのDNSプロバイダーを使用
- **冗長性**：必要に応じてプロバイダーを切り替え
- **コスト最適化**：最もコスト効率の良いオプションを選択
- **地域設定**：一部のプロバイダーは特定地域でより良く動作

## ✨ 主な機能

- 🔐 **安全な認証**：JWTベースの管理者ログイン
- 🔑 **APIキー管理**：複数のDNSプロバイダートークンの登録と管理
- 🌐 **ゾーン管理**：ドメインゾーンの選択と管理
- 📝 **DNSレコード**：A/CNAMEレコードの追加/編集/削除およびインライン編集
- 🔄 **スマート自動更新**：IP変更の自動検出と更新
- 📊 **監視**：更新ログとリアルタイムステータス
- 📤 **バックアップ/復元**：設定のJSONエクスポート/インポート
- 🌍 **多言語サポート**：韓国語、英語、日本語インターフェース
- 🌙 **ダークモード**：ライト/ダークテーマ切り替え対応
- 🎨 **モダントーストシステム**：絵文字なしのクリーンな通知、テーマ別背景色
- 🚨 **強化されたエラー処理**：すべてのAPIエラーをユーザーフレンドリーなトーストで自動表示
- 🔄 **CI/CD統合**：デプロイメントステータスのSlack通知
- 🐳 **Docker対応**：スケジューラーサポート付きの最適化されたDocker設定

## 🚀 クイックスタート

### 🐳 オプション1：Docker Hub（最速）

```bash
# Dockerでクイック実行
docker run -d \
  --name ddns-ui \
  -p 3000:3000 \
  -v ddns-data:/app/data \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=your-secure-password \
  -e JWT_SECRET=your-random-jwt-secret-key \
  --restart unless-stopped \
  gmkseta/ddns-ui:latest
```

### 🐳 オプション2：Docker Compose

```yaml
version: '3.8'
services:
  ddns-ui:
    image: gmkseta/ddns-ui:latest
    container_name: ddns-ui
    ports:
      - "3000:3000"
    environment:
      - ADMIN_USERNAME=admin
      - ADMIN_PASSWORD=your-secure-password
      - JWT_SECRET=your-random-jwt-secret-key
      - UPDATE_INTERVAL=5
    volumes:
      - ddns-data:/app/data
    restart: unless-stopped

volumes:
  ddns-data:
```

### 🖥️ オプション3：ローカル開発

```bash
# クローンとインストール
git clone https://github.com/gmkseta/ddns-ui
cd ddns-ui
yarn install

# 環境設定
cp .env.example .env.local
# .env.localを編集して設定

# 開発サーバー実行
yarn dev
```

## 📋 セットアップガイド

### 1. Cloudflare APIトークンの取得

1. [Cloudflare APIトークン](https://dash.cloudflare.com/profile/api-tokens)にアクセス
2. 「トークンを作成」をクリック
3. 「カスタムトークン」テンプレートを使用
4. 権限を設定：`Zone:Read`、`DNS:Edit`
5. ゾーンリソースにドメインを追加
6. 生成されたトークンをコピー

### 2. アプリケーションの設定

1. `http://localhost:3000`でWebインターフェースにアクセス
2. 管理者資格情報でログイン
3. 「APIキー設定」→ CloudflareトークンでWのログイン
4. ドメインゾーンを選択
5. DNSレコードを追加/管理
6. DDNS機能のために「自動更新」を有効化

### 3. 自動DDNSを楽しむ

- システムは5分ごとにパブリックIPをチェック
- IP変更時にDNSレコードを自動更新
- ダッシュボードで更新を監視
- 必要に応じて設定をエクスポート/インポート

## 🔧 環境変数

| 変数 | 説明 | デフォルト |
|----------|-------------|---------|
| `ADMIN_USERNAME` | 管理者ユーザー名 | `admin` |
| `ADMIN_PASSWORD` | 管理者パスワード | `changeme` |
| `JWT_SECRET` | JWTトークンシークレット | （必須） |
| `DATABASE_PATH` | SQLiteデータベースパス | `./data/db.sqlite3` |
| `UPDATE_INTERVAL` | 更新間隔（分） | `5` |
| `NODE_ENV` | 実行環境 | `development` |

## 🤖 AIペアプログラミングで構築

このプロジェクトは**Cursor AI**と**Claude Sonnet 4**を使用した**AI支援プログラミング**で開発されました。

### 🚀 開発プロセス
1. **アイデア創出**：AI支援要件収集
2. **アーキテクチャ**：最適な技術スタック選択
3. **コーディング**：リアルタイムAIコーディング支援
4. **最適化**：AI駆動のコードレビュー
5. **ドキュメント化**：包括的な自動生成ドキュメント
6. **デプロイメント**：Docker最適化と自動化

### 💡 AI開発の利点
- ⚡ **高速プロトタイピング**：アイデアを即座に実装
- 🔍 **コード品質**：AIが自動的にベストプラクティスを適用
- 📚 **学習**：開発中の継続的な知識移転
- 🐛 **バグ予防**：リアルタイムコード分析と修正

## 🛠️ 技術スタック

- **フロントエンド**：Next.js 15、React 19、TailwindCSS
- **バックエンド**：Next.js API Routes、Node.js
- **データベース**：SQLite3（ファイルベース、外部依存関係なし）
- **認証**：JWT（jose）
- **HTTPクライアント**：Axios
- **状態管理**：TanStack Query
- **アイコン**：Heroicons
- **デプロイメント**：Docker、Docker Compose

## 📚 APIドキュメント

### 認証
- `POST /api/auth/login` - ログイン
- `POST /api/auth/logout` - ログアウト
- `GET /api/auth/me` - 現在のユーザー情報

### IP検出
- `GET /api/ip` - 現在のパブリックIP取得

### 設定
- `GET/POST/DELETE /api/config/apikey` - APIキー管理

### DNS管理
- `GET /api/zones` - ゾーン一覧
- `GET/POST/PUT/DELETE /api/records` - DNSレコードCRUD

### DDNS更新
- `GET/POST /api/ddns/update` - 自動更新ステータス/実行

## 🔒 セキュリティ考慮事項

- JWTトークンベース認証
- APIキーはローカル保存（暗号化推奨）
- 本番環境ではHTTPS推奨
- 定期的なパスワード変更推奨
- セルフホストデプロイメントでのネットワーク分離

## 🌟 DDNSをセルフホストする理由

### 🏠 ホームラボに最適
- **ホームサーバー**：NAS、メディアサーバー、開発マシン
- **IoTデバイス**：Raspberry Pi、組み込みシステム
- **リモートアクセス**：SSH、VPN、どこからでもWebサービス

### 🏢 企業メリット
- **コスト管理**：大規模デプロイでドメインごとの料金なし
- **コンプライアンス**：DNSデータを社内で保持
- **統合**：カスタムワークフローと自動化
- **スケーラビリティ**：制限なしで数百のドメインを処理

### 🔧 開発者の利点
- **完全制御**：機能の変更と拡張
- **レート制限なし**：DNSプロバイダーが許可する範囲を超える
- **ローカル開発**：外部依存関係なしでの変更テスト
- **オープンソース**：コミュニティへの改善の貢献

## 📚 有用なリンク

### 🛠️ 開発ツール
- [Cursor AI](https://cursor.sh/) - AI駆動コードエディター
- [Claude Sonnet](https://www.anthropic.com/claude) - AIアシスタント

### 🌐 サービス
- [Cloudflare](https://www.cloudflare.com/) - DNSとCDNサービス
- [Docker Hub](https://hub.docker.com/r/gmkseta/ddns-ui) - コンテナレジストリ

### 📖 ドキュメント
- [Cloudflare API](https://developers.cloudflare.com/api/) - DNS APIドキュメント
- [Next.js](https://nextjs.org/) - Reactフレームワーク
- [Docker](https://docs.docker.com/) - コンテナ化ガイド

## 🙏 クレジット

- **開発**：AIペアプログラミング（Cursor + Claude Sonnet 4）
- **デザイン**：Tossデザインシステムからインスピレーション
- **インフラ**：Cloudflareの無料プランを活用
- **コミュニティ**：Docker Hubとオープンソースエコシステム

---

💡 **プロのヒント**：従来のDDNSサービスと比較して年間$25-55を節約し、より良いパフォーマンス、より多くの機能、DNS インフラストラクチャの完全な制御を獲得しましょう！ 