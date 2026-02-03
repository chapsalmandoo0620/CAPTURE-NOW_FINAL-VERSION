export type Locale = 'en' | 'ko' | 'ja' | 'zh';

export const dictionaries: Record<Locale, any> = {
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
            search: "Search",
            edit: "Edit",
            delete: "Delete",
            save: "Save",
            likes: "likes",
            comments: "Comments",
            share: "Share",
            copyLink: "Link copied to clipboard!",
            unknown: "Unknown"
        },
        nav: {
            home: "Home",
            meet: "Meet",
            upload: "Upload",
            profile: "Profile",
            menu: "Menu"
        },
        auth: {
            login: {
                title: "Sign In",
                email: "Email",
                password: "Password",
                signingIn: "Signing in...",
                signIn: "Sign In",
                or: "Or continue with",
                google: "Continue with Google",
                kakao: "Continue with Kakao",
                noAccount: "Don't have an account? Sign up"
            },
            signup: {
                title: "Create Account",
                email: "Email",
                password: "Password",
                creating: "Creating account...",
                createAccount: "Create Account",
                hasAccount: "Already have an account? Sign in",
                success: "Account created! Please sign in."
            }
        },
        home: {
            upcomingNearby: "Upcoming Nearby",
            seeAll: "See all",
            upNext: "Up Next",
            join: "Join",
            joined: "Joined",
            spotsAvailable: "spots available",
            noMeets: "No upcoming meetups nearby.",
            createOne: "Create one!",
            noPosts: "No posts yet",
            beFirst: "Be the first to share a highlight!",
            shareNow: "Share Now",
            notification: {
                title: "Notifications",
                empty: "No notifications yet.",
                markAllRead: "Mark all as read"
            }
        },
        meetup: {
            title: "Sessions",
            sortBy: "Sort by: Time",
            filter: {
                title: "Filter Sessions",
                sport: "Sport",
                level: "Level",
                distance: "Distance",
                host: "Host Name",
                reset: "Reset",
                apply: "Apply Filters",
                anyDist: "Any Distance"
            },
            card: {
                mySession: "My Session",
                closingSoon: "Closing Soon",
                ended: "Ended",
                viewDetails: "View Details",
                hostedBy: "Hosted by"
            },
            map: {
                youAreHere: "You are here",
                loading: "Loading Map..."
            },
            categories: {
                all: "All",
                running: "Running",
                cycling: "Cycling",
                soccer: "Soccer",
                basketball: "Basketball",
                tennis: "Tennis",
                golf: "Golf",
                climbing: "Climbing",
                fitness: "Fitness",
                yoga: "Yoga",
                swimming: "Swimming",
                hiking: "Hiking"
            },
            levels: {
                beginner: "Beginner",
                intermediate: "Intermediate",
                advanced: "Advanced",
                any: "Any"
            }
        },
        upload: {
            title: "New Post",
            selectPrompt: "Select Photo or Video",
            openCamera: "Open Camera",
            preview: "Preview",
            selectSport: "Select Sport (Optional)",
            selectLevel: "Select Level (Optional)",
            locationProto: "Location",
            locationPlace: "Add location name...",
            captionPlace: "Write a caption...",
            uploading: "Uploading...",
            shareMoment: "Share Moment",
            loginReq: "Please login to upload."
        },
        profile: {
            posts: "Posts",
            followers: "Followers",
            following: "Following",
            editProfile: "Edit Profile",
            shareProfile: "Share Profile",
            meetingScore: "Meeting Score",
            starPlayer: "Star Player",
            mannerPlayer: "Manner Player",
            noBookmarks: "No bookmarks yet.",
            edit: {
                title: "Edit Profile",
                save: "Save",
                saving: "Saving...",
                basicInfo: "Basic Info",
                tapChange: "Tap to change",
                nickname: "Nickname",
                location: "Main Location",
                locationHint: "(Map Selection Required)",
                searchPlaceholder: "Search area (e.g. Gangnam)",
                bio: "Bio (Caption)",
                bioPlaceholder: "Tell us about yourself...",
                sports: "Sports & Skills",
                vibe: "My Vibe"
            },
            tabs: {
                moments: "Moments",
                joined: "Joined"
            },
            emptyJoined: "You haven't joined any sessions yet.",
            findSession: "Find a Session"
        },
        notifications: {
            title: "Notifications",
            empty: "No notifications yet.",
            justNow: "Just now",
            types: {
                like: "New Like",
                comment: "New Comment",
                reminder: "Reminder",
                feedback: "Meeting Ended"
            },
            messages: {
                liked: "liked your post.",
                commented: "commented:",
                feedbackReq: "has ended. Please leave feedback!",
                getReady: "Get ready for"
            }
        },
        meetupDetail: {
            hostedBy: "Hosted by",
            distance: "Distance",
            joining: "Joining",
            aboutSession: "About Session",
            location: "Location",
            chat: "Chat",
            active: "Active",
            sessionEnded: "Session Ended",
            chatDisabled: "Session Ended - Chat Disabled",
            joinSession: "Join Session",
            leaveSession: "Leave Session",
            endMeetup: "End Meetup & Request Feedback",
            feedbackWait: "Ending the meetup will notify all participants to provide feedback.",
            loading: "Loading...",
            notFound: "Session not found",
            goBack: "Go Back",
            typeMessage: "Type a message...",
            noMessages: "No messages yet. Say hi!",
            joinToChat: "Join session to chat with members",
            loadingMap: "Loading Map...",
            noMap: "No map location provided"
        },
        messages: {
            title: "Messages",
            searchPlaceholder: "Search messages...",
            noMessages: "No messages yet.",
            newMessage: "New Message",
            following: "Following",
            noFollowing: "You aren't following anyone yet.",
            you: "You"
        },
        feed: {
            noComments: "No comments yet.",
            addComment: "Add a comment...",
            postBtn: "Post",
            deleteConfirm: "Are you sure you want to delete this post?",
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
            noHistory: "No finished meetups yet."
        },

        onboarding: {
            step1: {
                title: "Setup Profile",
                desc: "Let others know who you are.",
                nickname: "Nickname",
                bio: "Bio: Keep it short.",
                location: "Main Location",
                locationSearch: "Search area (e.g. Gangnam)",
                optional: "(Optional)"
            },
            step2: {
                title: "Your Sports",
                desc: "Select sports you're interested in.",
                add: "+ Add"
            },
            step3: {
                title: "Your Vibe",
                desc: "How do you like to play?",
                skillLevel: "Skill Level per Sport",
                noSports: "No sports selected.",
                vibes: {
                    fun: { label: "Fun", desc: "Just for fun & social." },
                    hard: { label: "Hard", desc: "Serious training & winning." },
                    grow: { label: "Grow", desc: "Learning & improving together." }
                }
            },
            buttons: {
                next: "Next",
                processing: "Processing...",
                start: "Start Now"
            }
        },
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
            search: "검색",
            edit: "수정",
            delete: "삭제",
            save: "저장",
            likes: "좋아요",
            comments: "댓글",
            share: "공유",
            copyLink: "링크가 복사되었습니다!",
            unknown: "알 수 없음"
        },
        nav: {
            home: "홈",
            meet: "모임",
            upload: "업로드",
            profile: "프로필",
            menu: "메뉴"
        },
        auth: {
            login: {
                title: "로그인",
                email: "이메일",
                password: "비밀번호",
                signingIn: "로그인 중...",
                signIn: "로그인",
                or: "또는",
                google: "Google로 계속하기",
                kakao: "Kakao로 계속하기",
                noAccount: "계정이 없으신가요? 회원가입"
            },
            signup: {
                title: "회원가입",
                email: "이메일",
                password: "비밀번호",
                creating: "계정 생성 중...",
                createAccount: "회원가입",
                hasAccount: "이미 계정이 있으신가요? 로그인",
                success: "계정이 생성되었습니다! 로그인해주세요."
            }
        },
        home: {
            upcomingNearby: "내 주변 모임",
            seeAll: "전체보기",
            upNext: "다음 일정",
            join: "참여",
            joined: "참여중",
            spotsAvailable: "자리 남음",
            noMeets: "주변에 예정된 모임이 없습니다.",
            createOne: "모임 만들기!",
            noPosts: "게시물이 없습니다",
            beFirst: "첫 번째 하이라이트를 공유해보세요!",
            shareNow: "지금 공유하기",
            notification: {
                title: "알림",
                empty: "새로운 알림이 없습니다.",
                markAllRead: "모두 읽음 처리"
            }
        },
        meetup: {
            title: "모임 세션",
            sortBy: "정렬: 시간순",
            filter: {
                title: "필터",
                sport: "종목",
                level: "레벨",
                distance: "거리",
                host: "호스트",
                reset: "초기화",
                apply: "필터 적용",
                anyDist: "모든 거리"
            },
            card: {
                mySession: "내 세션",
                closingSoon: "마감 임박",
                ended: "종료됨",
                viewDetails: "상세보기",
                hostedBy: "호스트:"
            },
            map: {
                youAreHere: "현재 위치",
                loading: "지도 불러오는 중..."
            },
            categories: {
                all: "전체",
                running: "러닝",
                cycling: "사이클",
                soccer: "축구",
                basketball: "농구",
                tennis: "테니스",
                golf: "골프",
                climbing: "클라이밍",
                fitness: "피트니스",
                yoga: "요가",
                swimming: "수영",
                hiking: "등산"
            },
            levels: {
                beginner: "초급",
                intermediate: "중급",
                advanced: "고급",
                any: "무관"
            }
        },
        upload: {
            title: "새 게시물",
            selectPrompt: "사진 또는 동영상 선택",
            openCamera: "카메라 열기",
            preview: "미리보기",
            selectSport: "종목 선택 (선택)",
            selectLevel: "레벨 선택 (선택)",
            locationProto: "위치",
            locationPlace: "위치 이름 추가...",
            captionPlace: "문구를 작성하세요...",
            uploading: "업로드 중...",
            shareMoment: "공유하기",
            loginReq: "로그인이 필요합니다."
        },
        profile: {
            posts: "게시물",
            followers: "팔로워",
            following: "팔로잉",
            editProfile: "프로필 수정",
            shareProfile: "프로필 공유",
            meetingScore: "모임 점수",
            starPlayer: "스타 플레이어",
            mannerPlayer: "매너 플레이어",
            noBookmarks: "저장된 북마크가 없습니다.",
            edit: {
                title: "프로필 수정",
                save: "저장",
                saving: "저장 중...",
                basicInfo: "기본 정보",
                tapChange: "변경하려면 탭하세요",
                nickname: "닉네임",
                location: "주 활동 지역",
                locationHint: "(지도 선택 필수)",
                searchPlaceholder: "지역 검색 (예: 강남)",
                bio: "자기소개",
                bioPlaceholder: "자신에 대해 알려주세요...",
                sports: "스포츠 및 실력",
                vibe: "나의 바이브"
            },
            tabs: {
                moments: "모먼트",
                joined: "참여내역"
            },
            emptyJoined: "아직 참여한 모임이 없습니다.",
            findSession: "모임 찾기"
        },
        notifications: {
            title: "알림",
            empty: "아직 알림이 없습니다.",
            justNow: "방금 전",
            types: {
                like: "새로운 좋아요",
                comment: "새로운 댓글",
                reminder: "모임 알림",
                feedback: "모임 종료"
            },
            messages: {
                liked: "님이 회원님의 게시물을 좋아합니다.",
                commented: "님이 댓글을 남겼습니다:",
                feedbackReq: "모임이 종료되었습니다. 피드백을 남겨주세요!",
                getReady: "모임 준비하세요:"
            }
        },
        meetupDetail: {
            hostedBy: "호스트:",
            distance: "거리",
            joining: "참여 중",
            aboutSession: "모임 소개",
            location: "위치",
            chat: "채팅",
            active: "활동 중",
            sessionEnded: "모임 종료",
            chatDisabled: "모임 종료 - 채팅 불가",
            joinSession: "참여하기",
            leaveSession: "나가기",
            endMeetup: "모임 종료 및 피드백 요청",
            feedbackWait: "모임을 종료하면 모든 참여자에게 피드백 요청이 전송됩니다.",
            loading: "로딩 중...",
            notFound: "모임을 찾을 수 없습니다",
            goBack: "뒤로 가기",
            typeMessage: "메시지 입력...",
            noMessages: "메시지가 없습니다. 인사를 건네보세요!",
            joinToChat: "모임에 참여하여 대화를 나눠보세요",
            loadingMap: "지도 로딩 중...",
            noMap: "위치 정보가 없습니다"
        },
        messages: {
            title: "메시지",
            searchPlaceholder: "메시지 검색...",
            noMessages: "메시지가 없습니다.",
            newMessage: "새 메시지",
            following: "팔로잉",
            noFollowing: "아직 팔로우 중인 사용자가 없습니다.",
            you: "나"
        },
        feed: {
            noComments: "댓글이 없습니다.",
            addComment: "댓글 달기...",
            postBtn: "게시",
            deleteConfirm: "정말 이 게시물을 삭제하시겠습니까?",
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
            noHistory: "종료된 모임이 없습니다."
        },

        onboarding: {
            step1: {
                title: "프로필 설정",
                desc: "자신을 소개해 주세요.",
                nickname: "닉네임",
                bio: "소개글: 짧게 입력해주세요.",
                location: "주 활동 지역",
                locationSearch: "지역 검색 (예: 강남)",
                optional: "(선택)"
            },
            step2: {
                title: "관심 종목",
                desc: "관심 있는 스포츠를 선택하세요.",
                add: "+ 추가"
            },
            step3: {
                title: "나의 스타일",
                desc: "어떤 스타일로 즐기시나요?",
                skillLevel: "종목별 실력",
                noSports: "선택된 종목이 없습니다.",
                vibes: {
                    fun: { label: "즐겜", desc: "재미와 친목 위주" },
                    hard: { label: "빡겜", desc: "진지한 훈련과 승부" },
                    grow: { label: "성장", desc: "함께 배우고 발전하기" }
                }
            },
            buttons: {
                next: "다음",
                processing: "처리 중...",
                start: "시작하기"
            }
        },
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
            search: "検索",
            edit: "編集",
            delete: "削除",
            save: "保存",
            likes: "いいね",
            comments: "コメント",
            share: "共有",
            copyLink: "リンクをコピーしました！",
            unknown: "不明"
        },
        nav: {
            home: "ホーム",
            meet: "集まり",
            upload: "投稿",
            profile: "プロフィール",
            menu: "メニュー"
        },
        auth: {
            login: {
                title: "ログイン",
                email: "メールアドレス",
                password: "パスワード",
                signingIn: "ログイン中...",
                signIn: "ログイン",
                or: "または",
                google: "Googleで続ける",
                kakao: "Kakaoで続ける",
                noAccount: "アカウントをお持ちでないですか？登録"
            },
            signup: {
                title: "アカウント作成",
                email: "メールアドレス",
                password: "パスワード",
                creating: "作成中...",
                createAccount: "アカウント作成",
                hasAccount: "すでにアカウントをお持ちですか？ログイン",
                success: "アカウントが作成されました！ログインしてください。"
            }
        },
        home: {
            upcomingNearby: "近くの集まり",
            seeAll: "すべて見る",
            upNext: "次の予定",
            join: "参加",
            joined: "参加中",
            spotsAvailable: "空きあり",
            noMeets: "近くに予定された集まりはありません。",
            createOne: "集まりを作る！",
            noPosts: "投稿がまだありません",
            beFirst: "最初のハイライトを共有しましょう！",
            shareNow: "共有する",
            notification: {
                title: "通知",
                empty: "新しい通知はありません。",
                markAllRead: "すべて既読にする"
            }
        },
        meetup: {
            title: "セッション一覧",
            sortBy: "並び替え: 時間順",
            filter: {
                title: "フィルター",
                sport: "種目",
                level: "レベル",
                distance: "距離",
                host: "ホスト",
                reset: "リセット",
                apply: "適用",
                anyDist: "すべての距離"
            },
            card: {
                mySession: "自分のセッション",
                closingSoon: "締切間近",
                ended: "終了",
                viewDetails: "詳細を見る",
                hostedBy: "ホスト:"
            },
            map: {
                youAreHere: "現在地",
                loading: "地図を読み込み中..."
            },
            categories: {
                all: "すべて",
                running: "ランニング",
                cycling: "サイクリング",
                soccer: "サッカー",
                basketball: "バスケ",
                tennis: "テニス",
                golf: "ゴルフ",
                climbing: "クライミング",
                fitness: "フィットネス",
                yoga: "ヨガ",
                swimming: "水泳",
                hiking: "ハイキング"
            },
            levels: {
                beginner: "初級",
                intermediate: "中級",
                advanced: "上級",
                any: "不問"
            }
        },
        upload: {
            title: "新規投稿",
            selectPrompt: "写真または動画を選択",
            openCamera: "カメラを開く",
            preview: "プレビュー",
            selectSport: "種目を選択 (任意)",
            selectLevel: "レベルを選択 (任意)",
            locationProto: "位置情報",
            locationPlace: "場所の名前を追加...",
            captionPlace: "キャプションを入力...",
            uploading: "アップロード中...",
            shareMoment: "共有する",
            loginReq: "ログインが必要です。"
        },
        profile: {
            posts: "投稿",
            followers: "フォロワー",
            following: "フォロー中",
            editProfile: "プロフィール編集",
            shareProfile: "プロフィール共有",
            meetingScore: "集まりスコア",
            starPlayer: "スタープレイヤー",
            mannerPlayer: "マナープレイヤー",
            noBookmarks: "ブックマークはまだありません。",
            edit: {
                title: "プロフィール編集",
                save: "保存",
                saving: "保存中...",
                basicInfo: "基本情報",
                tapChange: "タップして変更",
                nickname: "ニックネーム",
                location: "主な活動地域",
                locationHint: "(地図選択必須)",
                searchPlaceholder: "地域検索 (例: 江南)",
                bio: "自己紹介",
                bioPlaceholder: "あなたについて教えてください...",
                sports: "スポーツ & スキル",
                vibe: "私のバイブ"
            },
            tabs: {
                moments: "モーメント",
                joined: "参加履歴"
            },
            emptyJoined: "まだ参加した集まりがありません。",
            findSession: "集まりを探す"
        },
        notifications: {
            title: "通知",
            empty: "まだ通知はありません。",
            justNow: "たった今",
            types: {
                like: "新しい「いいね！」",
                comment: "新しいコメント",
                reminder: "リマインダー",
                feedback: "ミーティング終了"
            },
            messages: {
                liked: "さんがあなたの投稿に「いいね！」しました。",
                commented: "さんがコメントしました:",
                feedbackReq: "が終了しました。フィードバックを残してください！",
                getReady: "の準備をしましょう！"
            }
        },
        meetupDetail: {
            hostedBy: "主催:",
            distance: "距離",
            joining: "参加中",
            aboutSession: "ミートアップについて",
            location: "場所",
            chat: "チャット",
            active: "アクティブ",
            sessionEnded: "終了",
            chatDisabled: "終了 - チャット不可",
            joinSession: "参加する",
            leaveSession: "退室する",
            endMeetup: "終了してフィードバックをリクエスト",
            feedbackWait: "終了すると全員にフィードバックリクエストが送信されます。",
            loading: "読み込み中...",
            notFound: "セッションが見つかりません",
            goBack: "戻る",
            typeMessage: "メッセージを入力...",
            noMessages: "メッセージはまだありません。挨拶してみましょう！",
            joinToChat: "参加してチャットしよう",
            loadingMap: "地図を読み込み中...",
            noMap: "位置情報がありません"
        },
        messages: {
            title: "メッセージ",
            searchPlaceholder: "メッセージを検索...",
            noMessages: "メッセージはありません。",
            newMessage: "新規メッセージ",
            following: "フォロー中",
            noFollowing: "フォロー中のユーザーがいません。",
            you: "あなた"
        },
        feed: {
            noComments: "コメントがありません。",
            addComment: "コメントを追加...",
            postBtn: "投稿",
            deleteConfirm: "本当にこの投稿を削除しますか？",
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
            noHistory: "終了した集まりはまだありません。"
        },

        onboarding: {
            step1: {
                title: "プロフィール設定",
                desc: "あなたについて教えてください。",
                nickname: "ニックネーム",
                bio: "自己紹介: 短く入力してください。",
                location: "主な活動エリア",
                locationSearch: "エリア検索 (例: 渋谷)",
                optional: "(任意)"
            },
            step2: {
                title: "興味のあるスポーツ",
                desc: "興味のあるスポーツを選択してください。",
                add: "+ 追加"
            },
            step3: {
                title: "プレイスタイル",
                desc: "どのように楽しみますか？",
                skillLevel: "スポーツ別レベル",
                noSports: "選択されたスポーツがありません。",
                vibes: {
                    fun: { label: "エンジョイ", desc: "楽しみと交流重視" },
                    hard: { label: "ガチ", desc: "本気のトレーニングと勝負" },
                    grow: { label: "成長", desc: "共に学び、成長する" }
                }
            },
            buttons: {
                next: "次へ",
                processing: "処理中...",
                start: "始める"
            }
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
            search: "搜索",
            edit: "编辑",
            delete: "删除",
            save: "保存",
            likes: "点赞",
            comments: "评论",
            share: "分享",
            copyLink: "链接已复制到剪贴板！",
            unknown: "未知"
        },
        nav: {
            home: "首页",
            meet: "聚会",
            upload: "发布",
            profile: "我的",
            menu: "菜单"
        },
        auth: {
            login: {
                title: "登录",
                email: "邮箱",
                password: "密码",
                signingIn: "登录中...",
                signIn: "登录",
                or: "或",
                google: "使用Google继续",
                kakao: "使用Kakao继续",
                noAccount: "没有账号？注册"
            },
            signup: {
                title: "创建账号",
                email: "邮箱",
                password: "密码",
                creating: "创建中...",
                createAccount: "创建账号",
                hasAccount: "已有账号？登录",
                success: "账号已创建！请登录。"
            }
        },
        home: {
            upcomingNearby: "附近聚会",
            seeAll: "查看全部",
            upNext: "即将开始",
            join: "加入",
            joined: "已加入",
            spotsAvailable: "个名额",
            noMeets: "附近暂无聚会。",
            createOne: "创建一个！",
            noPosts: "暂无帖子",
            beFirst: "分享你的第一个精彩瞬间！",
            shareNow: "立即分享",
            notification: {
                title: "通知",
                empty: "暂无新通知。",
                markAllRead: "全部已读"
            }
        },
        meetup: {
            title: "聚会列表",
            sortBy: "排序：时间",
            filter: {
                title: "筛选",
                sport: "运动项目",
                level: "等级",
                distance: "距离",
                host: "发起人",
                reset: "重置",
                apply: "应用筛选",
                anyDist: "任意距离"
            },
            card: {
                mySession: "我的活动",
                closingSoon: "即将截止",
                ended: "已结束",
                viewDetails: "查看详情",
                hostedBy: "发起人："
            },
            map: {
                youAreHere: "你的位置",
                loading: "地图加载中..."
            },
            categories: {
                all: "全部",
                running: "跑步",
                cycling: "骑行",
                soccer: "足球",
                basketball: "篮球",
                tennis: "网球",
                golf: "高尔夫",
                climbing: "攀岩",
                fitness: "健身",
                yoga: "瑜伽",
                swimming: "游泳",
                hiking: "徒步"
            },
            levels: {
                beginner: "初级",
                intermediate: "中级",
                advanced: "高级",
                any: "不限"
            }
        },
        upload: {
            title: "发布动态",
            selectPrompt: "选择照片或视频",
            openCamera: "打开相机",
            preview: "预览",
            selectSport: "选择项目 (可选)",
            selectLevel: "选择等级 (可选)",
            locationProto: "位置",
            locationPlace: "添加位置名称...",
            captionPlace: "写点什么...",
            uploading: "上传中...",
            shareMoment: "发布动态",
            loginReq: "请先登录。"
        },
        profile: {
            posts: "动态",
            followers: "粉丝",
            following: "关注",
            editProfile: "编辑资料",
            shareProfile: "分享个人主页",
            meetingScore: "聚会评分",
            starPlayer: "明星玩家",
            mannerPlayer: "礼貌玩家",
            noBookmarks: "尚无书签。",
            edit: {
                title: "编辑个人资料",
                save: "保存",
                saving: "保存中...",
                basicInfo: "基本信息",
                tapChange: "点击更改",
                nickname: "昵称",
                location: "主要活动区域",
                locationHint: "(必须选择地图)",
                searchPlaceholder: "搜索区域 (例如: 江南)",
                bio: "自我介绍",
                bioPlaceholder: "这就是我...",
                sports: "运动与技能",
                vibe: "我的氛围"
            },
            tabs: {
                moments: "动态",
                joined: "参与记录"
            },
            emptyJoined: "暂无参与记录。",
            findSession: "寻找聚会"
        },
        notifications: {
            title: "通知",
            empty: "暂无通知。",
            justNow: "刚刚",
            types: {
                like: "新赞",
                comment: "新评论",
                reminder: "提醒",
                feedback: "会议结束"
            },
            messages: {
                liked: "赞了你的帖子。",
                commented: "评论了:",
                feedbackReq: "已结束。请留下反馈！",
                getReady: "准备参加"
            }
        },
        meetupDetail: {
            hostedBy: "发起人:",
            distance: "距离",
            joining: "已加入",
            aboutSession: "关于聚会",
            location: "位置",
            chat: "聊天",
            active: "活跃",
            sessionEnded: "聚会结束",
            chatDisabled: "聚会结束 - 禁止聊天",
            joinSession: "加入聚会",
            leaveSession: "退出聚会",
            endMeetup: "结束聚会并请求反馈",
            feedbackWait: "结束聚会后将向所有参与者发送反馈请求。",
            loading: "加载中...",
            notFound: "未找到聚会",
            goBack: "返回",
            typeMessage: "输入消息...",
            noMessages: "暂无消息。打个招呼吧！",
            joinToChat: "加入聚会以参与聊天",
            loadingMap: "地图加载中...",
            noMap: "无位置信息"
        },
        messages: {
            title: "消息",
            searchPlaceholder: "搜索消息...",
            noMessages: "暂无消息。",
            newMessage: "新消息",
            following: "关注列表",
            noFollowing: "尚未关注任何用户。",
            you: "你"
        },
        feed: {
            noComments: "暂无评论。",
            addComment: "添加评论...",
            postBtn: "发送",
            deleteConfirm: "确定要删除这条动态吗？",
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
            noHistory: "暂无已结束的聚会。"
        },

        onboarding: {
            step1: {
                title: "设置资料",
                desc: "让大家认识你。",
                nickname: "昵称",
                bio: "简介：请简短介绍。",
                location: "主要活动区域",
                locationSearch: "搜索区域 (如: 江南)",
                optional: "(可选)"
            },
            step2: {
                title: "感兴趣的运动",
                desc: "选择你感兴趣的运动。",
                add: "+ 添加"
            },
            step3: {
                title: "运动风格",
                desc: "你喜欢的运动方式？",
                skillLevel: "各项目水平",
                noSports: "未选择运动。",
                vibes: {
                    fun: { label: "娱乐", desc: "注重乐趣与社交" },
                    hard: { label: "竞技", desc: "认真的训练与比赛" },
                    grow: { label: "成长", desc: "共同学习与进步" }
                }
            },
            buttons: {
                next: "下一步",
                processing: "处理中...",
                start: "开始"
            }
        }
    }
};
