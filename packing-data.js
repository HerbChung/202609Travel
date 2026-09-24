/* Stable IDs keep progress compatible with future content updates. */
window.PACKING_CATEGORIES = [
  ['documents','证件与出行资料'],['clothes','衣物与鞋子'],['outdoors','森林、瀑布与海岸'],['wash','温泉与洗漱'],['care','日常照护与随身用品'],['tech','电子设备与自驾'],['bags','分装与当地补给']
];
window.PACKING_MEMBERS = {all:'全家',adult1:'大人 1',adult2:'大人 2',child:'孩子',shared:'全家共用'};
window.PACKING_ITEMS = [];
(() => {
  const add=(owner,cat,id,name,qty,bag,note='')=>window.PACKING_ITEMS.push({id:owner+'-'+id,owner,cat,name,qty,bag,note});
  for(const owner of ['adult1','adult2','child']) {
    const child=owner==='child';
    add(owner,'documents','passport','护照、签证及入境资料','1套','随身包','原件随身，订单与资料保留离线副本。');
    for(const [id,name,adultQty,childQty,note] of [
      ['shirts','短袖／速干上衣','5件','6–7件','数量包含出发当天穿的。'],
      ['longshirts','薄长袖','2件','3件','森林、车内、早晚叠穿。'],
      ['fleece','薄抓绒／轻保暖外套','1件','1件','阿苏、大观峰、黑川与金鳞湖清晨。'],
      ['raincoat','有帽防水外套','1件','1件','屋久岛与瀑布；放在容易拿到的位置。'],
      ['pants','轻薄长裤／速干裤','3条','4条','徒步与城市通用。'],
      ['shorts','短裤／裙装','1–2件','1–2件','按习惯和天气选择，可设为本次不带。'],
      ['underwear','内衣裤','7套','内裤8–10条','按途中洗衣约两次准备。'],
      ['socks','袜子','6–7双','8双','森林日多备一双。'],
      ['pajamas','睡衣','1套','2套','自带更合身。'],
      ['dinner','整洁的晚餐衣服','1套','1套','计入日常衣物，不额外多带。一高无正式着装要求；なかがわ推荐整洁休闲搭配，无需西装或专门的礼服。旅馆餐厅浴衣规则以现场为准。'],
      ['shoes','已穿习惯的防滑步行鞋','1双','1双','不在森林徒步时首次穿新鞋。'],
      ['spareshoes','轻便备用鞋','1双','1双','主鞋淋湿后替换。'],
      ['hat','帽子','1顶','1顶','海岸、草千里与城市。']
    ]) add(owner,'clothes',id,name,child?childQty:adultQty,'衣物袋',note);
    add(owner,'outdoors','rainpants','防水裤','1条','日用包','屋久岛徒步遇雨时使用。');
    add(owner,'outdoors','towel','小速干毛巾','1条','日用包');
    add(owner,'outdoors','bottle','水瓶','1个','随身包');
    add(owner,'bags','shoebag','轻便鞋袋','1个','行李箱','隔离森林散步后的泥鞋；Samana有洗鞋区及客房烘鞋器，无需自带烘鞋器。');
    add(owner,'wash','toothbrush','牙刷、牙膏','1套','洗漱包');
    add(owner,'wash','personalwash',child?'惯用洗护用品':'护肤、梳子及个人洗护用品','按需','洗漱包');
    add(owner,'wash','swim','泳衣／泳镜（可选）','按需','行李箱','现行行程可不带。Grand Hyatt儿童泳池要求身高至少120cm、09:00–17:00预约使用，与D1晚到／D2上午外出不匹配。成人另有游泳计划再带；其他酒店未查到泳池设施，温泉不等于泳池。');
    add(owner,'care','medicine','个人必需药物及说明','旅程用量','随身包','保留原包装、必要处方资料；请勿在备注里记录敏感医疗资料。');
    if(!child){add(owner,'documents','wallet','支付卡、日元现金','按需','随身包','两位大人分开放置。');add(owner,'tech','phone','手机、充电线','1套','随身包');add(owner,'wash','glasses','眼镜／隐形眼镜及护理用品','按需','随身包');}
  }
  const shared=(cat,id,name,qty,bag,note)=>add('shared',cat,id,name,qty,bag,note);
  shared('documents','orders','航班、酒店、列车及餐厅预约记录','1套离线副本','手机／证件包','四段航班、新干线、Sonic及重点餐厅。');
  shared('documents','driving','租车认可的驾驶证件原件及配套文件','1套','证件包','以租车公司已核实的证件要求为准。');
  shared('documents','rental','租车订单、儿童座椅确认信息','两段订单','手机／证件包');
  shared('documents','insurance','保险保单、紧急联系电话','1套','手机／证件包');
  shared('documents','internet','网络方案、离线地图及最新行程','1套','手机');
  add('child','documents','contact','家长联系卡','1张','随身','填写家长电话、住宿及必要的过敏信息，实体卡随身。');
  shared('outdoors','umbrella','折叠伞','1–2把','日用包','主要用于城镇。');
  shared('outdoors','daypacks','主背包＋轻便副包','各1个','随身');
  shared('outdoors','raincover','背包防雨罩／防水内袋','1–2个','日用包');
  shared('outdoors','drybags','防水袋／密封袋','4–6个','日用包','手机、干衣服与湿衣服分开。');
  shared('outdoors','sun','防晒用品、太阳镜','按需','日用包');
  shared('outdoors','repellent','惯用驱蚊用品','按需','日用包','选择适合各自年龄的产品。');
  shared('outdoors','firstaid','创可贴、防磨脚贴、小包纱布','1套','日用包');
  shared('outdoors','tissues','纸巾、湿巾、垃圾袋','首两日用量','随身包','D2可在屋久岛补充。');
  shared('outdoors','light','轻便头灯／手电','1个','日用包','作为备用。');
  shared('outdoors','poles','成人登山杖（可选）','按使用习惯','行李箱／当地租赁','开放短线不必全家配备；需要牵孩子时保留空手。不建议给孩子临时购入未经练习的杖。Samana有装备租赁，杖的库存需另询；携带方式按航空公司规定。');
  shared('outdoors','lenscloth','眼镜／镜头擦拭布','1–2块','日用包','擦拭瀑布水雾与雨滴。');
  shared('outdoors','binoculars','小望远镜（可选）','已有则带1个','日用包','全家共用，观察山景、海岸；不必专门购买。');
  shared('wash','onsenbag','温泉手提袋／小洗漱包','1–2个','行李箱');
  shared('wash','wetbags','湿物收纳袋','2个','行李箱');
  shared('wash','slippers','轻便拖鞋','按需','行李箱','按各自习惯，可设为本次不带。');
  shared('wash','bathingwrap','汤浴衣／遮挡浴巾（可选）','按参与人数','行李箱','仅确定去平内海中温泉泡汤时准备；混浴且岩面湿滑，禁止泳衣，可用浴巾或汤浴衣遮挡。普通酒店泡汤无需为此多带大浴巾。');
  shared('care','thermometer','体温计','1支','随身包');
  shared('care','sickness','晕车清洁包','1套','座位旁','呕吐袋3–5个、纸巾、湿巾、密封袋。');
  shared('care','familygame','家庭卡牌／旅行记录本（可选）','选1样','随身包','旅馆休息时全家一起玩或记录旅程，避免和现有绘本重复装太多。');
  add('child','care','measure','惯用药品的原配量具','按需','随身包');
  add('child','care','comfort','安抚玩偶／熟悉的小毯子','选1件','随身包');
  add('child','care','books','贴纸书、画笔、小绘本','选2–3样','随身包');
  add('child','care','tablet','平板、耳机及已下载内容','按需','随身包');
  add('child','care','snacks','小包装零食','转场日用量','随身包');
  add('child','care','diapers','夜间拉拉裤','按需','行李箱','仅仍有需要时携带。');
  add('child','care','stroller','轻便折叠推车','按需','单独携带','平时仍午睡或走久需要坐时考虑；森林和瀑布台阶不依赖推车。');
  shared('tech','adapter','两扁脚转换插头、多口充电器','1–2个／1个','随身包','确认充电器支持100–240V；转换插头不转换电压。');
  shared('tech','powerbank','标识清晰的充电宝','1–2个','随身包','不可托运，机上携带和使用按当次航空公司要求。');
  shared('tech','car','车载充电器、USB线、导航支架','1套','自驾包');
  shared('tech','camera','相机及配件','按需','随身包');
  shared('tech','scale','行李电子秤、折叠购物袋','各1个','行李箱');
  shared('bags','d1','D1福冈一晚小袋','三人1套','易取位置','睡衣、内衣、次日衣服和洗漱用品。');
  shared('bags','d6','D6熊本一晚小袋','三人1套','易取位置','晚到酒店后快速取用。');
  shared('bags','carspare','车内备用衣物包','每人1套','车内','干衣服、备用鞋；贵重物品随身。');
  shared('bags','hike','森林日换洗小袋','1套','日用包','孩子完整干衣服、三人备用袜子。');
  shared('bags','laundry','脏衣袋、洗衣用品','1套','行李箱','原有项目保留：干脏衣与湿衣分装。Samana及ONE FUKUOKA自助洗衣自动投放洗剂，不带大瓶洗衣液；新增网袋、衣夹见下方。');
  shared('bags','laundrymesh','洗衣网袋','2–3个','洗衣袋','Samana D4／D5期间主洗；ONE FUKUOKA D11晚补洗。D6熊本有自助洗衣，但晚到仅作备用。');
  shared('bags','laundryclips','小衣夹','4–6个','洗衣袋','晾少量手洗衣物；烘干设备规格未逐店确认，不要前晚才洗次日唯一一件衣服。');
  shared('bags','handwash','少量手洗清洁剂（可选）','小份','洗衣袋','仅用于内衣袜子应急手洗；机洗无需额外投放洗剂。D5至D11间可穿插少量手洗。');
  shared('bags','d2shop','D2屋久岛日用补给','四晚所需','当地购买','Drugstore Mori：水、食品、纸巾等。');
  shared('bags','d12shop','D12返程采购及行李整理','按需','当地购买','天神松本清＋Reganet，预留行李空间。');
})();
