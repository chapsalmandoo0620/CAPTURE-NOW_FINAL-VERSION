export type Locale = 'en' | 'ko' | 'ja' | 'zh';

export const dictionaries = {
    en: {
        common: {
            next: "Next",
            skip: "Skip",
            start: "Get Started",
            close: "Close",
            loading: "Loading...",
            confirm: "Confirm",
            cancel: "Cancel",
            language: "Language",
        },
        tutorial: {
            step1: {
                title: "Welcome to",
                titleAccent: "CAPTURE NOW",
                desc: "Your ultimate playground for sports highlights and joining 'Lightning' meetups.",
            },
            step2: {
                title: "Feed & Interactions",
                desc: "Scroll to explore moments from the community. Engage with others using:",
                like: "Like",
                comment: "Comment",
                save: "Save",
            },
            step3: {
                title: "Share Your Moments",
                desc: "Got a great shot? Tap the (+) button at the bottom center to upload photos or videos.",
                action: "Tap to Upload",
            },
            step4: {
                title: "Join the Action",
                desc: "Find 'Lightning' meetups nearby. Filter by Sport (⚽🏀), Distance, or Time.",
                soccer: "Soccer",
                hoops: "Hoops",
                nearMe: "Near Me",
                today: "Today",
            },
            step5: {
                title: "Host a Meetup",
                desc: "Want to lead? Tap (+) in the Meet tab. Set location, time, and gather your squad.",
                create: "Create Meetup",
            },
            step6: {
                title: "Menu & Tracking",
                desc: "Check 'My Activity' for bookmarks and history. Stay updated with announcements.",
                history: "History",
                saved: "Saved",
            },
            stepMock: {
                park: "Han River Park",
                time: "Fri, 7:00 PM",
            }
        },
        menu: {
            title: "Menu",
            myActivity: "My Activity",
            appInfo: "App Info",
            bookmarks: "Bookmarks",
            history: "Meeting History",
            tutorial: "Tutorial",
            announcements: "Announcements",
            terms: "Terms of Service",
            privacy: "Privacy Policy",
            notifications: "Notifications",
            logout: "Log Out",
            deleteAccount: "Delete Account",
            version: "CAPTURE NOW v1.0.0",
            poweredBy: "Powered by Antigravity",
        }
    },
    ko: {
        common: {
            next: "다음",
            skip: "건너뛰기",
            start: "시작하기",
            close: "닫기",
            loading: "로딩 중...",
            confirm: "확인",
            cancel: "취소",
            language: "언어 설정",
        },
        tutorial: {
            step1: {
                title: "환영합니다",
                titleAccent: "CAPTURE NOW",
                desc: "스포츠 하이라이트 공유와 번개 모임을 위한 최고의 놀이터에 오신 것을 환영합니다.",
            },
            step2: {
                title: "피드 & 소통",
                desc: "커뮤니티의 멋진 순간들을 구경하세요. 좋아요, 댓글, 저장으로 소통해보세요.",
                like: "좋아요",
                comment: "댓글",
                save: "저장",
            },
            step3: {
                title: "순간을 공유하세요",
                desc: "멋진 장면을 포착했나요? 하단 중앙의 (+) 버튼을 눌러 사진이나 영상을 업로드하세요.",
                action: "업로드하기",
            },
            step4: {
                title: "모임 참여하기",
                desc: "내 주변 '번개' 모임을 찾아보세요. 종목(⚽🏀), 거리, 시간으로 필터링할 수 있습니다.",
                soccer: "축구",
                hoops: "농구",
                nearMe: "내 주변",
                today: "오늘",
            },
            step5: {
                title: "모임 주최하기",
                desc: "리더가 되고 싶나요? 모임 탭의 (+)를 눌러보세요. 장소와 시간을 정하고 멤버를 모으세요.",
                create: "모임 만들기",
            },
            step6: {
                title: "메뉴 & 활동 기록",
                desc: "'내 활동'에서 북마크와 모임 참여 기록을 확인하세요. 공지사항도 놓치지 마세요.",
                history: "기록",
                saved: "저장됨",
            },
            stepMock: {
                park: "한강 공원",
                time: "금요일 오후 7:00",
            }
        },
        menu: {
            title: "메뉴",
            myActivity: "내 활동",
            appInfo: "앱 정보",
            bookmarks: "북마크",
            history: "모임 기록",
            tutorial: "튜토리얼",
            announcements: "공지사항",
            terms: "이용 약관",
            privacy: "개인정보 처리방침",
            notifications: "알림",
            logout: "로그아웃",
            deleteAccount: "계정 삭제",
            version: "CAPTURE NOW v1.0.0",
            poweredBy: "Powered by Antigravity",
        }
    },
    ja: {
        common: {
            next: "次へ",
            skip: "スキップ",
            start: "始める",
            close: "閉じる",
            loading: "読み込み中...",
            confirm: "確認",
            cancel: "キャンセル",
            language: "言語設定",
        },
        tutorial: {
            step1: {
                title: "ようこそ",
                titleAccent: "CAPTURE NOW",
                desc: "スポーツのハイライト共有と「ライトニング」ミートアップのための究極の遊び場へ。",
            },
            step2: {
                title: "フィードと交流",
                desc: "コミュニティの瞬間をスクロールして探索しましょう。いいね、コメント、保存で交流できます。",
                like: "いいね",
                comment: "コメント",
                save: "保存",
            },
            step3: {
                title: "瞬間をシェア",
                desc: "素晴らしいショットが撮れましたか？ 下部中央の（+）ボタンをタップして写真や動画をアップロードしましょう。",
                action: "アップロード",
            },
            step4: {
                title: "アクションに参加",
                desc: "近くの「ライトニング」ミートアップを見つけましょう。スポーツ(⚽🏀)、距離、時間でフィルタリングできます。",
                soccer: "サッカー",
                hoops: "バスケ",
                nearMe: "近く",
                today: "今日",
            },
            step5: {
                title: "ミートアップを主催",
                desc: "リードしたいですか？ ミートタブの（+）をタップ。場所、時間を設定して仲間を集めましょう。",
                create: "作成する",
            },
            step6: {
                title: "メニューと記録",
                desc: "「私のアクティビティ」でブックマークと履歴を確認できます。お知らせもチェックしましょう。",
                history: "履歴",
                saved: "保存済み",
            },
            stepMock: {
                park: "漢江公園",
                time: "金曜 午後7:00",
            }
        },
        menu: {
            title: "メニュー",
            myActivity: "私のアクティビティ",
            appInfo: "アプリ情報",
            bookmarks: "ブックマーク",
            history: "参加履歴",
            tutorial: "チュートリアル",
            announcements: "お知らせ",
            terms: "利用規約",
            privacy: "プライバシーポリシー",
            notifications: "通知",
            logout: "ログアウト",
            deleteAccount: "アカウント削除",
            version: "CAPTURE NOW v1.0.0",
            poweredBy: "Powered by Antigravity",
        }
    },
    zh: {
        common: {
            next: "下一步",
            skip: "跳过",
            start: "开始",
            close: "关闭",
            loading: "加载中...",
            confirm: "确认",
            cancel: "取消",
            language: "语言设置",
        },
        tutorial: {
            step1: {
                title: "欢迎来到",
                titleAccent: "CAPTURE NOW",
                desc: "分享精彩运动瞬间和加入“闪电”聚会的终极平台。",
            },
            step2: {
                title: "动态与互动",
                desc: "滑动浏览社区精彩瞬间。通过点赞、评论和保存与他人互动。",
                like: "点赞",
                comment: "评论",
                save: "收藏",
            },
            step3: {
                title: "分享你的瞬间",
                desc: "拍到了精彩镜头？点击底部中间的（+）按钮上传照片或视频。",
                action: "点击上传",
            },
            step4: {
                title: "参与活动",
                desc: "发现附近的“闪电”聚会。按运动(⚽🏀)、距离或时间筛选。",
                soccer: "足球",
                hoops: "篮球",
                nearMe: "附近",
                today: "今天",
            },
            step5: {
                title: "发起聚会",
                desc: "想带头吗？点击聚会标签页的（+）。设定地点、时间，召集你的队伍。",
                create: "创建聚会",
            },
            step6: {
                title: "菜单与记录",
                desc: "在“我的活动”中查看书签和历史记录。随时关注最新公告。",
                history: "历史",
                saved: "已保存",
            },
            stepMock: {
                park: "汉江公园",
                time: "周五 19:00",
            }
        },
        menu: {
            title: "菜单",
            myActivity: "我的活动",
            appInfo: "应用信息",
            bookmarks: "书签",
            history: "聚会记录",
            tutorial: "教程",
            announcements: "公告",
            terms: "服务条款",
            privacy: "隐私政策",
            notifications: "通知",
            logout: "登出",
            deleteAccount: "删除账户",
            version: "CAPTURE NOW v1.0.0",
            poweredBy: "Powered by Antigravity",
        }
    }
};
