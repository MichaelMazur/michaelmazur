var Graph = {

	Canvas: null,
	Context: null,

	Height: 0,
	Width: 0,

	XTiles: 256,
	YTiles: 32,
	
	Interval: null,
	IntervalTime: 20,

	DataSet: [ ],
	LineDistance: 16,
  HeightScale: 0.5,

	HeightmapURL: "http://i.imgur.com/qr7YY.jpg",
	HeightmapImage: null,
	
	Offset: 0,//320;
  Time: 0,
  
  MouseX: 0,
  MouseY: 0,
  MouseRadius: 400,

	Init: function () {

		this.Height = $(window).height();
		this.Width = $(window).width();

		this.Canvas = $("#cCanvas");
		//this.Canvas.attr("height", this.Height);
		//this.Canvas.attr("width", this.Width);
		this.Canvas.attr("height", 600);
		this.Canvas.attr("width", 600);

		document.body.onmousemove = function(_event) {
			Graph.MouseX = _event.pageX;
			Graph.MouseY = _event.pageY;
		};
    
		this.Context = this.Canvas[0].getContext("2d");

		this.HeightmapImage = new Image();
		this.HeightmapImage.crossOrigin = "Anonymous";
		this.HeightmapImage.onload = function () {

			Graph.Context.drawImage(Graph.HeightmapImage, 0, 0, Graph.XTiles, Graph.YTiles);

			var PixelData = Graph.Context.getImageData(0, 0, Graph.XTiles, Graph.YTiles).data;

			for (var l = 0; l < Graph.YTiles; l++) {
				var NewLineData = [ ];
				Graph.DataSet.push(NewLineData);
				for (var p = 0; p < Graph.XTiles; p++) {
					var StartIndex = ((l * Graph.XTiles) + p) * 4;
					var R = PixelData[StartIndex];
					NewLineData.push(R * Graph.HeightScale);
				}
			}
			
			Graph.Interval = setInterval(function () {
				Graph.Update()
			}, Graph.IntervalTime);

		};
		this.HeightmapImage.style.display = "none";
		this.HeightmapImage.src = this.HeightmapURL;

	},

	Update: function () {

    this.Time += 0.2;
		this.Offset = 0;
	
		if (this.DataSet == null || this.DataSet.length == 0) {
			return;
		}
	
    this.Context.lineWidth = 2;
		this.Context.fillStyle = "#1b1b1b";
		this.Context.fillRect(0, 0, this.Width, this.Height);

		var HeightRatio = 1.4 * this.Height / (this.DataSet.length - 1)
		var WidthRatio = this.Width / (this.DataSet[0].length - 1);

		for (var l = this.DataSet.length - 1; l > -1; l--) {

			var Distance = l * (HeightRatio * (1 - 0.26 * (l / this.DataSet.length)));
		
			var Brightness = Math.round(Math.max(0.0, Math.min(255.0, 255.0 * (this.Height - Distance - this.Offset) / this.Height)));
			this.Context.strokeStyle = "rgb(" + Brightness + "," + Brightness + "," + Brightness + ")";

			var LineData = this.DataSet[l];
			
			this.Context.beginPath();
			this.Context.moveTo(0, this.Height - Distance - LineData[0] - this.Offset);
			for (var p = 1; p < LineData.length; p++) {
				var XDiff = p * WidthRatio - this.MouseX;
				var YDiff = 2 * (this.Height - Distance - this.Offset) - (this.MouseY + 320);
				var MouseDistance = this.MouseRadius - Math.sqrt(XDiff * XDiff + YDiff * YDiff);
				MouseDistance = Math.max(MouseDistance, 0.0) / this.MouseRadius;
				this.Context.lineTo(p * WidthRatio, (this.Height - Distance - Math.sin(this.Time + (p * 0.5) + (l * 2)) * (1 + MouseDistance * 0.1) - MouseDistance * LineData[p] - this.Offset));
			}
			this.Context.stroke();

		}

	}

};

Graph.Init();